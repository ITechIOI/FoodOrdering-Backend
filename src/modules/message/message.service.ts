import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/entities/message.entity';
import { UsersService } from '../users/users.service';
import { firebaseAdmin } from './firebase-admin';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UsersService,
  ) {}

  async sendMessageNotification(createMessageInput: CreateMessageInput) {
    const sender = await this.userService.findOneById(
      createMessageInput.senderId,
    );
    const receiver = await this.userService.findOneById(
      createMessageInput.receiverId,
    );
    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    if (!receiver?.expoMessageToken) {
      throw new NotFoundException(
        `Receiver with ID ${createMessageInput.receiverId} does not have an expo message token`,
      );
    }

    // await fetch('https://exp.host/--/api/v2/push/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept-Encoding': 'gzip, deflate',
    //     Accept: 'application/json',
    //   },
    //   body: JSON.stringify({
    //     to: receiver.expoMessageToken,
    //     title: 'You have a new message',
    //     body: createMessageInput.content,
    //     data: { senderId: createMessageInput.senderId },
    //   }),
    // });

    await firebaseAdmin.messaging().send({
      token: receiver.expoMessageToken,
      notification: {
        title: 'You have a new message',
        body: createMessageInput.content,
      },
      data: {
        senderId: String(createMessageInput.senderId),
      },
    });

    const message = this.messageRepository.create({
      ...createMessageInput,
      sender,
      receiver,
    });

    return await this.messageRepository.save(message);
  }

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageInput: UpdateMessageInput) {
    return `This action updates a #${id} message`;
  }

  async remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
