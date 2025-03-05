import { Controller, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationGateway } from './notification.gateway';

@Controller()
export class NotificationConsumer implements OnModuleInit {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  async onModuleInit() {
    console.log('✅ Consumer Initialized and Listening for Events');
  }

  @EventPattern('send.otp')
  handleSendOtp(@Payload() data: any) {
    console.log(`🔹 Received OTP event: `, data);
    this.notificationGateway.publishEvent('otpSent', data);
  }

  @EventPattern('order.success')
  handleOrderSuccess(@Payload() data: any) {
    console.log(`✅ Order success event: `, data);
    this.notificationGateway.publishEvent('orderSuccess', data);
  }

  @EventPattern('order.status.update')
  handleOrderStatusUpdate(@Payload() data: any) {
    console.log(`📦 Order status update event: `, data);
    this.notificationGateway.publishEvent('orderStatusUpdated', data);
  }
}
