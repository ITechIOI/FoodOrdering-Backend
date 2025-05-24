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

    const roomId = [createMessageInput.senderId, createMessageInput.receiverId]
      .sort()
      .join('_');

    const db = getDatabase(); // hoặc getDatabase(firebaseAdmin)

    const newRef = firebaseDatabase.ref(`chats/${roomId}/messages`).push();
    const firebaseMessageRef = firebaseDatabase
      .ref(`chats/${roomId}/messages`)
      .push();

    const firebaseKey = firebaseMessageRef.key;

    const message = this.messageRepository.create({
      ...createMessageInput,
      sender,
      receiver,
      firebaseKey,
    });
    const savedMessage = await this.messageRepository.save(message);

    await firebaseMessageRef.set({
      text: createMessageInput.content,
      timestamp: Date.now(),
      senderId: createMessageInput.senderId,
      receiverId: createMessageInput.receiverId,
      messageId: savedMessage.id, // 👈 Thêm vào Firebase để FE sử dụng
    });

    return await this.messageRepository.save(message);
  }

  async update(id: number, updateMessageInput: UpdateMessageInput) {
    const message = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.id = :id', { id })
      .getOne();

    if (!message) throw new NotFoundException('Message not found');

    const roomId = [message.sender.id, message.receiver.id].sort().join('_');
    if (message.firebaseKey) {
      await firebaseDatabase
        .ref(`chats/${roomId}/messages/${message.firebaseKey}`)
        .update({ text: updateMessageInput.content });
    }

    message.content = updateMessageInput.content || '';
    return await this.messageRepository.save(message);
  }

  async remove(id: number) {
    const message = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.id = :id', { id })
      .getOne();

    if (!message) throw new NotFoundException('Message not found');

    const roomId = [message.sender.id, message.receiver.id].sort().join('_');
    if (message.firebaseKey) {
      await firebaseDatabase
        .ref(`chats/${roomId}/messages/${message.firebaseKey}`)
        .remove();
    }

    await this.messageRepository.remove(message);
    return 'Message deleted successfully';
  }
}
