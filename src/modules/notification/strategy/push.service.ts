import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ClientRMQ } from '@nestjs/microservices';

@Injectable()
export class PushService implements INotification {
  constructor(
    @Inject('PUSH_NOTIFICATION_SERVICE') private rabbitClient: ClientRMQ,
    private readonly configService: ConfigService,
  ) {}

  async sendNotification(
    expoToken: string,
    title: string,
    body: string,
    imageUrl?: string,
    data?: Record<string, string>,
  ): Promise<any> {
    if (!expoToken || !expoToken.startsWith('ExponentPushToken')) {
      throw new Error('❌ Invalid Expo push token');
    }

    const messagePayload = {
      to: expoToken,
      sound: 'default',
      title,
      body,
      ...(imageUrl && { image: imageUrl }),
      ...(data && { data }),
    };

    try {
      const response = await axios.post(
        'https://exp.host/--/api/v2/push/send',
        messagePayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      // Emit log or save message status
      this.rabbitClient.emit('push_notification', {
        token: expoToken,
        payload: messagePayload,
        response: response.data,
      });

      return response.data.id;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0]?.message || error.message;
      console.error('❌ Expo Push API Error:', msg);
      console.error('Payload that caused error:', messagePayload);
      throw new Error(`Expo push failed: ${msg}`);
    }
  }
}
