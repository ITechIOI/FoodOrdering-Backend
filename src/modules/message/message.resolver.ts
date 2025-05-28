import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message } from '../../entities/message.entity';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  @UseGuards(AuthGuard)
  async sendMessageNotification(
    @Args('createMessageInput') createMessageInput: CreateMessageInput,
  ) {
    return await this.messageService.sendMessageNotification(
      createMessageInput,
    );
  }

  @Mutation(() => Message)
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  async removeMessage(@Args('id', { type: () => Int }) id: number) {
    return await this.messageService.remove(id);
  }
}
