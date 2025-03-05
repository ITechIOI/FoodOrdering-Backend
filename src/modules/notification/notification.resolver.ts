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
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { pubSub } from 'src/utils/pubsub';
import { NotificationGateway } from './notification.gateway';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Mutation(() => Notification)
  createNotification(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationService.create(createNotificationInput);
  }

  @Subscription(() => String, {
    resolve: (payload) => payload,
  })
  otpSent() {
    return this.notificationGateway
      .getPubSub()
      .asyncIterableIterator('otpSent');
  }

  @Query(() => [Notification], { name: 'notification' })
  findAll() {
    return this.notificationService.findAll();
  }

  @Query(() => Notification, { name: 'notification' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.notificationService.findOne(id);
  }

  @Mutation(() => Notification)
  updateNotification(
    @Args('updateNotificationInput')
    updateNotificationInput: UpdateNotificationInput,
  ) {
    return this.notificationService.update(
      updateNotificationInput.id,
      updateNotificationInput,
    );
  }

  @Mutation(() => Notification)
  removeNotification(@Args('id', { type: () => Int }) id: number) {
    return this.notificationService.remove(id);
  }

  @Mutation(() => String)
  async sendNotification() {
    return this.notificationService.sendNotification();
  }
}
