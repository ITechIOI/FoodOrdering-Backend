import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from '../../entities/message.entity';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';

@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  async sendMessageNotification(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
  ) {
    return await this.messageService.sendMessageNotification(
      createMessageInput,
    );
  }

  @Mutation(() => Message)
  async updateMessage(
    @Args('updateMessageInput') updateMessageInput: UpdateMessageInput,
  ): Promise<Message> {
    console.log('updateMessageInput', updateMessageInput);
    return await this.messageService.update(
      updateMessageInput.id,
      updateMessageInput,
    );
  }

  @Mutation(() => String)
  async removeMessage(@Args('id', { type: () => Int }) id: number) {
    return await this.messageService.remove(id);
  }
}
