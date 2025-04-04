import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { formatGraphQLError } from './common/interceptors/error.interceptor';
import { EmailService } from './common/services/notification/email.service';
import { NotificationModule } from './modules/notification/notification.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MapModule } from './modules/map/map.module';
import { CategoryModule } from './modules/category/category.module';
import { AddressModule } from './modules/address/address.module';
import { DiscountModule } from './modules/discount/discount.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { OrderDetailsModule } from './modules/order_details/order_details.module';
import { PaymentModule } from './modules/payment/payment.module';
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { RevenueReportModule } from './modules/revenue_report/revenue_report.module';
import { ReviewModule } from './modules/review/review.module';
import * as redisStore from 'cache-manager-ioredis';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { CacheWorkerModule } from './modules/cache_worker/cache_worker.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheService } from './common/cache/cache.service';
import { ComplaintModule } from './modules/complaint/complaint.module';
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore,
        host: 'redis-service',
        port: 6379,
        ttl: 6000,
      }),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schemas/schema.gql'),
      csrfPrevention: false,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      installSubscriptionHandlers: true,

      formatError: formatGraphQLError,
    }),

    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
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

        {
          name: 'PAYMENT_SERVICE',
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [
                configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost',
              ],
              queue: configService.get<string>('RABBITMQ_QUEUE_PAYMENT') ?? '',
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },

        {
          name: 'REDIS_SERVICE',
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [
                configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost',
              ],
              queue: configService.get<string>('REDIS_QUEUE') ?? '',
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },

        {
          name: 'PUSH_NOTIFICATION_SERVICE',
          useFactory: (configService: ConfigService) => ({
            transport: Transport.RMQ,
            options: {
              urls: [
                configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost',
              ],
              queue: configService.get<string>('RABBITMQ_QUEUE_PUSH') ?? '',
              queueOptions: {
                durable: true,
              },
            },
          }),
          inject: [ConfigService],
        },
      ],
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    RolesModule,
    NotificationModule,
    CloudinaryModule,
    ComplaintModule,
    MapModule,
    AddressModule,
    CategoryModule,
    DiscountModule,
    MenuModule,
    OrderModule,
    OrderDetailsModule,
    PaymentModule,
    RestaurantModule,
    RevenueReportModule,
    ReviewModule,
    CacheWorkerModule,
  ],
  controllers: [],
  providers: [AppResolver, EmailService, CacheService],
})
export class AppModule {}
