import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationConsumer } from './notification.consumer';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') || 'amqp://localhost',
            ],
            exchange: 'notification_exchange',
            exchangeType: 'direct',
            queues: [
              {
                name: configService.get<string>('RABBITMQ_QUEUE_OTP'),
                routingKey: 'send.otp',
              },
              {
                name: configService.get<string>('RABBITMQ_QUEUE_ORDER'),
                routingKey: 'order.success',
              },
              {
                name: configService.get<string>('RABBITMQ_QUEUE_ORDER_STATUS'),
                routingKey: 'order.status.update',
              },
            ],
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    NotificationResolver,
    NotificationService,
    NotificationConsumer,
    NotificationGateway,
  ],
})
export class NotificationModule {}
