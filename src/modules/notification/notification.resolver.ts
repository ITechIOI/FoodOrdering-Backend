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
import { pubSub } from 'src/utils/pubsub';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation(() => Notification)
  createNotification(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationService.create(createNotificationInput);
  }

  @EventPattern('otp_authentication')
  async handleOrderCreated(@Payload() message: any, @Ctx() ctx: RmqContext) {
    console.log('Send.otp');
    const routingKey = ctx.getMessage().fields.routingKey;
    console.log('📩 Routing key:', routingKey);
    // console.log('📩 Routing key:', ctx);
    console.log('📩 Message:', message);
  }

  // @EventPattern('send.otp')
  // async handleOrderCreated(orderData: any) {
  //   console.log('Received Order:', orderData);
  //   await pubSub.publish('send.otp', { orderCreated: orderData });
  // }

  // @MessagePattern('send.otp')
  // handlePayment(data: { amount: string }) {
  //   console.log('💸 Handle payment:', data.amount);
  // }

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

  @Query(() => String)
  async sendNotification() {
    return this.notificationService.sendNotification();
  }
}
