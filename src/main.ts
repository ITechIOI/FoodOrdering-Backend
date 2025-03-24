// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { GraphQLExceptionFilter } from './common/exception-filters/http.exception.filter';
// import { WinstonModule } from 'nest-winston';
// import { winstonLogger } from './common/loggers/winston-logger';
// import { graphqlUploadExpress } from 'graphql-upload-minimal';
// import { join } from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule, {
//     logger: WinstonModule.createLogger({
//       instance: winstonLogger, // ✅ Sử dụng Winston nhưng giữ nguyên format mặc định
//     }),
//   });

//   app.useStaticAssets(join(__dirname, '..', 'modules/payment/templates'));
//   app.useGlobalFilters(new GraphQLExceptionFilter());
//   app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));
//   await app.listen(3001);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GraphQLExceptionFilter } from './common/exception-filters/http.exception.filter';
import { CustomLoggerService } from './common/loggers/custom-logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './common/loggers/winston-logger';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  const configService = app.get(ConfigService);

  // Use Express to serve static files
  app.useStaticAssets(join(__dirname, '..', 'modules/payment/templates'));
  // Middleware cho GraphQL Exception
  app.useGlobalFilters(new GraphQLExceptionFilter());
  // Middleware for file upload in GraphQL
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

  const rabbitUrl = configService.get<string>('RABBITMQ_URL') || '';
  const otpQueue = configService.get<string>('RABBITMQ_QUEUE_OTP') || '';
  const orderQueue = configService.get<string>('RABBITMQ_QUEUE_ORDER') || '';
  const statusQueue =
    configService.get<string>('RABBITMQ_QUEUE_ORDER_STATUS') || '';

  const otpAuthenticationApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: otpQueue,
        queueOptions: {
          durable: true,
        },
      },
    });
  const orderConfirmationApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: orderQueue,
        queueOptions: {
          durable: true,
        },
      },
    });
  const orderStatusApp =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: statusQueue,
        queueOptions: {
          durable: true,
        },
      },
    });

  otpAuthenticationApp.listen();
  orderConfirmationApp.listen();
  orderStatusApp.listen();

  await app.listen(3000);
}

bootstrap();
