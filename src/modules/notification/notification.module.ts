import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    // ClientsModule.registerAsync([
    //   {
    //     name: 'NOTIFICATION_SERVICE',
    //     useFactory: (configService: ConfigService) => ({
    //       transport: Transport.RMQ,
    //       options: {
    //         urls: [
    //           configService.get<string>('RABBITMQ_URL') || 'amqp://localhost',
    //         ],
    //         // RABBITMQ_QUEUE_OTP=otp_authentication
    //         // RABBITMQ_QUEUE_ORDER=order_confirmation
    //         // RABBITMQ_QUEUE_ORDER_STATUS=order_status
    //         exchange: 'notification_exchange',
    //         exchangeType: 'direct',
    //         queues: [
    //           {
    //             name: configService.get<string>('RABBITMQ_QUEUE_OTP'),
    //             routingKey: 'send.otp',
    //           },
    //           {
    //             name: configService.get<string>('RABBITMQ_QUEUE_ORDER'),
    //             routingKey: 'order.success',
    //           },
    //           {
    //             name: configService.get<string>('RABBITMQ_QUEUE_ORDER_STATUS'),
    //             routingKey: 'order.status.update',
    //           },
    //         ],
    //         queueOptions: { durable: true },
    //       },
    //     }),
    //     inject: [ConfigService],
    //   },
    // ]),

    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost',
            ],
            queue: configService.get<string>('RABBITMQ_QUEUE_OTP') ?? '',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [NotificationResolver, NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
