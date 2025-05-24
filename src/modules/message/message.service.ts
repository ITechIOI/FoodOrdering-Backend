import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageInput } from './dto/create-message.input';
import { UpdateMessageInput } from './dto/update-message.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from 'src/entities/message.entity';
import { UsersService } from '../users/users.service';
import { firebaseAdmin, firebaseDatabase } from './firebase-admin';
import { getDatabase } from 'firebase-admin/database';

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

    // Đoạn thông tin này được dùng để gửi thông báo đẩy đến người nhận
    // if (!receiver?.expoMessageToken) {
    //   throw new NotFoundException(
    //     `Receiver with ID ${createMessageInput.receiverId} does not have an expo message token`,
    //   );
    // }
    // await firebaseAdmin.messaging().send({
    //   token: receiver.expoMessageToken,
    //   notification: {
    //     title: 'You have a new message',
    //     body: createMessageInput.content,
    //   },
    //   data: {
    //     senderId: String(createMessageInput.senderId),
    //   },
    // });

    const message = this.messageRepository.create({
      ...createMessageInput,
      sender,
      receiver,
    });

    const roomId = [createMessageInput.senderId, createMessageInput.receiverId]
      .sort()
      .join('_');

    const messageData = {
      text: createMessageInput.content,
      senderId: createMessageInput.senderId,
      receiverId: createMessageInput.receiverId,
      timestamp: Date.now(),
    };

    const db = getDatabase(); // hoặc getDatabase(firebaseAdmin)

    await firebaseDatabase.ref(`chats/${roomId}/messages`).push({
      text: createMessageInput.content,
      timestamp: Date.now(),
      senderId: createMessageInput.senderId,
      receiverId: createMessageInput.receiverId,
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
