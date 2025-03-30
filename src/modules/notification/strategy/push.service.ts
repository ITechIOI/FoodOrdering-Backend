import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';
import { join } from 'path';
import * as fs from 'fs';
import { ClientRMQ } from '@nestjs/microservices';

// Firebase Configuration
@Injectable()
export class PushService implements INotification {
  private accessToken: string;
  private readonly projectId: string;
  private readonly serviceAccountPath;

  constructor(
    @Inject('PUSH_NOTIFICATION_SERVICE') private rabbitClient: ClientRMQ,
  ) {
    console.log(
      'Root folder:',
      join(process.cwd(), 'food-ordering-app-firebase.json'),
    );
    this.serviceAccountPath = join(
      process.cwd(),
      'food-ordering-app-firebase.json',
    );
    const serviceAccount = JSON.parse(
      fs.readFileSync(this.serviceAccountPath, 'utf-8'),
    );
    this.projectId = serviceAccount.project_id;

    if (!this.projectId) {
      throw new Error(
        '❌ Không tìm thấy project_id trong file service account.',
      );
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    imageUrl?: string,
    data?: Record<string, string>,
  ): Promise<any> {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`;

    const message = {
      message: {
        token,
        notification: {
          title,
          body,
          ...(imageUrl ? { image: imageUrl } : {}),
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            color: '#f45342',
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            icon: 'https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-notification-icon-png-image_927192.jpg',
          },
        },
        ...(data ? { data } : {}),
      },
    };

    try {
      // const response = await axios.post(url, message, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //     Authorization: `Bearer ${this.accessToken}`,
      //   },
      // });

      let emitMessage: (string | object)[] = [];
      emitMessage.push(url);
      emitMessage.push(message);
      emitMessage.push({
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      //console.log('✅ FCM notification sent:', emitMessage);
      this.rabbitClient.emit('push_notification', emitMessage);
      return emitMessage[1];
    } catch (error) {
      const msg = error.response?.data?.error?.message || error.message;
      console.error('❌ FCM Error:', msg);
      throw new Error(`FCM failed: ${msg}`);
    }
  }

  async getAccessToken() {
    const auth = new GoogleAuth({
      keyFile: join(process.cwd(), 'food-ordering-app-firebase.json'),
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    try {
      const client = await auth.getClient();
      const token = await client.getAccessToken();

      if (!token.token) {
        throw new Error('Failed to retrieve access token');
      }

      console.log('Access token:', token.token);
      this.accessToken = token.token;
    } catch (err) {
      throw new Error(`Error getting access token: ${err.message}`);
    }
  }
}
