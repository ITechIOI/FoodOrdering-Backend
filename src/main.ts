import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GraphQLExceptionFilter } from './common/exception-filters/http.exception.filter';
import { CustomLoggerService } from './common/loggers/custom-logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonLogger } from './common/loggers/winston-logger';
import { graphqlUploadExpress } from 'graphql-upload-minimal';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger, // ✅ Sử dụng Winston nhưng giữ nguyên format mặc định
    }),
  });
  app.useGlobalFilters(new GraphQLExceptionFilter());
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));
  await app.listen(3001);
}
bootstrap();
