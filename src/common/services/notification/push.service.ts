// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import * as admin from 'firebase-admin';

// // Firebase Configuration
// @Injectable()
// export class PushService implements OnModuleInit, INotification {
//   private projectId;
//   private clientEmail;
//   private privateKey;

//   constructor(private readonly configService: ConfigService) {
//     this.projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
//     this.clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
//     this.privateKey = this.configService
//       .get<string>('FIREBASE_PRIVATE_KEY')
//       ?.replace(/\\n/g, '\n');
//   }

//   onModuleInit() {
//     if (!admin.apps.length) {
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           projectId: this.projectId,
//           clientEmail: this.clientEmail,
//           privateKey: this.privateKey,
//         }),
//       });
//     }
//   }

//   async sendNotification(to: string, subject: string, message: string) {
//     const payload: admin.messaging.Message = {
//       token: to,
//       notification: {
//         title: subject,
//         body: message,
//       },
//       android: {
//         priority: 'high',
//       },
//       apns: {
//         headers: {
//           'apns-priority': '10',
//         },
//       },
//     };

//     try {
//       const response = await admin.messaging().send(payload);
//       return response; // ID của thông báo đã gửi
//     } catch (error) {
//       throw new Error(`FCM send failed: ${error.message}`);
//     }
//   }
// }
