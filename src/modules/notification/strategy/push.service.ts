// import { Inject, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
// import { GoogleAuth } from 'google-auth-library';
// import { ClientRMQ } from '@nestjs/microservices';

// @Injectable()
// export class PushService implements INotification {
//   private accessToken: string;
//   private readonly projectId: string;

//   constructor(
//     @Inject('PUSH_NOTIFICATION_SERVICE') private rabbitClient: ClientRMQ,
//     private readonly configService: ConfigService,
//   ) {
//     this.projectId =
//       this.configService.get<string>('FIREBASE_PROJECT_ID') || '';

//     if (!this.projectId) {
//       throw new Error(
//         '❌ Missing FIREBASE_PROJECT_ID in environment variables.',
//       );
//     }
//   }

//   async sendNotification(
//     token: string,
//     title: string,
//     body: string,
//     imageUrl?: string,
//     data?: Record<string, string>,
//   ): Promise<any> {
//     if (!this.accessToken) {
//       await this.getAccessToken();
//     }

//     const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`;

//     const message = {
//       message: {
//         token,
//         notification: {
//           title,
//           body,
//           ...(imageUrl ? { image: imageUrl } : {}),
//         },
//         android: {
//           priority: 'high',
//           notification: {
//             sound: 'default',
//             color: '#f45342',
//             click_action: 'FLUTTER_NOTIFICATION_CLICK',
//           },
//         },
//         apns: {
//           headers: { 'apns-priority': '10' },
//           payload: {
//             aps: {
//               sound: 'default',
//               badge: 1,
//             },
//           },
//         },
//         webpush: {
//           headers: { Urgency: 'high' },
//           notification: {
//             icon: 'https://png.pngtree.com/png-vector/20190411/ourmid/pngtree-vector-notification-icon-png-image_927192.jpg',
//           },
//         },
//         ...(data ? { data } : {}),
//       },
//     };

//     try {
//       const emitMessage = [
//         url,
//         message,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${this.accessToken}`,
//           },
//         },
//       ];

//       this.rabbitClient.emit('push_notification', emitMessage);
//       return message;
//     } catch (error) {
//       const msg = error.response?.data?.error?.message || error.message;
//       console.error('❌ FCM Error:', msg);
//       throw new Error(`FCM failed: ${msg}`);
//     }
//   }

//   async getAccessToken() {
//     const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
//     const privateKey = this.configService
//       .get<string>('FIREBASE_PRIVATE_KEY')
//       ?.replace(/\\n/g, '\n');

//     if (!clientEmail || !privateKey) {
//       throw new Error('❌ Missing FIREBASE_CLIENT_EMAIL or PRIVATE_KEY in env');
//     }

//     const auth = new GoogleAuth({
//       credentials: {
//         client_email: clientEmail,
//         private_key: privateKey,
//       },
//       scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
//     });

//     try {
//       const client = await auth.getClient();
//       const token = await client.getAccessToken();

//       if (!token.token) throw new Error('Failed to retrieve access token');

//       this.accessToken = token.token;
//     } catch (err) {
//       throw new Error(`Error getting access token: ${err.message}`);
//     }
//   }
// }

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

      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0]?.message || error.message;
      console.error('❌ Expo Push API Error:', msg);
      console.error('Payload that caused error:', messagePayload);
      throw new Error(`Expo push failed: ${msg}`);
    }
  }
}
