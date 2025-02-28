import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { CustomLoggerService } from '../loggers/custom-logger.service';

@Catch(HttpException)
export class GraphQLExceptionFilter implements ExceptionFilter {
  private readonly logger = new CustomLoggerService();

  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);

    const error = {
      statusCode: exception.getStatus(),
      message: exception.message,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(`GraphQL Error: ${exception.message}`, exception.stack);

    console.log('Filter: ', error);
    throw exception;
  }
}
