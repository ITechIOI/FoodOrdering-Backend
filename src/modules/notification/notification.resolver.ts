import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Subscription,
} from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedNotification = createPaginatedType(
  Notification,
  'PaginatedNotification',
);

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation(() => Notification)
  async createNotification(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
  ) {
    return await this.notificationService.create(createNotificationInput);
  }

  @EventPattern('otp_authentication')
  async handleOrderCreated(@Payload() message: any, @Ctx() ctx: RmqContext) {
    console.log('Send.otp');
    const routingKey = ctx.getMessage().fields.routingKey;
    console.log('Routing key:', routingKey);
    console.log('Message:', message);
  }

  // @Query(() => String)
  // async sendNotification() {
  //   return await this.notificationService.sendNotification();
  // }

  @Query(() => PaginatedNotification)
  async findNotificationByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    return await this.notificationService.findByIdUser(userId, page, limit);
  }
}
