import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import {
  ClientProxy,
  ClientRMQ,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { pubSub } from 'src/utils/pubsub';
import * as amqp from 'amqplib';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_SERVICE') private rabbitClient: ClientRMQ,
  ) {}

  async sendNotification() {
    await this.rabbitClient.connect();
    this.rabbitClient.emit('otp_authentication', 'Hihi');

    return 'Message sent';
  }

  create(createNotificationInput: CreateNotificationInput) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationInput: UpdateNotificationInput) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
