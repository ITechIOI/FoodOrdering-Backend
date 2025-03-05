import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class NotificationGateway {
  private pubSub = new PubSub();

  publishEvent(eventName: string, data: any) {
    this.pubSub.publish(eventName, { [eventName]: data });
  }

  getPubSub() {
    return this.pubSub;
  }
}
