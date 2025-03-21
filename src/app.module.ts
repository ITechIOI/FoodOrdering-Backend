import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { DatabaseModule } from './database/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UsersModule } from './modules/users/users.module';
import { UsersResolver } from './modules/users/users.resolver';
import { AuthResolver } from './modules/auth/auth.resolver';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLFormattedError } from 'graphql';
import { formatGraphQLError } from './common/interceptors/error.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EmailService } from './common/services/email.service';
import { NotificationModule } from './modules/notification/notification.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { MapModule } from './modules/map/map.module';
import { Address } from './entities/address.entity';
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
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schemas/schema.gql'),
      // autoSchemaFile: true,
      // Format response lỗi
      // formatError: (error: GraphQLFormattedError) => {
      //   const extensions = error.extensions || {};
      //   return {
      //     statusCode: (extensions['statusCode'] as number) || 500,
      //     message: error.message || 'Internal Server Error',
      //     data: null,
      //   };
      // },
      csrfPrevention: false,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      installSubscriptionHandlers: true,

      formatError: formatGraphQLError,
    }),

    DatabaseModule,
    UsersModule,
    AuthModule,
    RolesModule,
    NotificationModule,
    CloudinaryModule,
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
  ],
  providers: [AppResolver, EmailService],
})
export class AppModule {}
