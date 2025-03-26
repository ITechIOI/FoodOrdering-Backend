import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements INotification {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Cấu hình Mailtrap SMTP
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAILTRAP_HOST'),
      port: this.configService.get<number>('MAILTRAP_PORT'),
      auth: {
        user: this.configService.get<string>('MAILTRAP_USER'),
        pass: this.configService.get<string>('MAILTRAP_PASS'),
      },
    });
  }

  //  Hàm gửi email
  async sendNotification(to: string, subject: string, message: string) {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to,
      subject: subject,
      text: `Mã OTP của bạn là: ${message} (Có hiệu lực trong 1 phút)`,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`📧 Fake email is sent successfully to ${to}`);
  }
}
