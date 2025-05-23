import * as admin from 'firebase-admin';
import { config } from 'dotenv';
config();

const raw = process.env.FIREBASE_MESSAGE_PRIVATE_KEY || '';
// Nếu giá trị còn bao trong dấu ", trim chúng:
const trimmed = raw.replace(/^"(.*)"$/, '$1');
// Thay \\n thành xuống dòng thật:
const privateKey = trimmed.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_MESSAGE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_MESSAGE_CLIENT_EMAIL!,
    privateKey,
  }),
});

export const firebaseAdmin = admin;
