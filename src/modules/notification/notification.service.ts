import { UsersService } from 'src/modules/users/users.service';
import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { ClientRMQ } from '@nestjs/microservices';
import { PushService } from './strategy/push.service';
import { EmailService } from './strategy/email.service';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  private notificationStrategy: INotification;

  constructor(
    @Inject('NOTIFICATION_SERVICE') private rabbitClient: ClientRMQ,
    @Inject('PUSH_NOTIFICATION_SERVICE') private pushRabbitClient: ClientRMQ,
    private readonly configService: ConfigService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly userService: UsersService,
  ) {
    // ✅ Truyền đầy đủ cả 2 tham số
    this.notificationStrategy = new PushService(
      this.pushRabbitClient,
      this.configService,
    );
  }

  async sendNotification() {
    await this.rabbitClient.connect();
    this.rabbitClient.emit('otp', 'Hihi');

    return 'Message sent';
  }

  async create(
    createNotificationDto: CreateNotificationInput,
  ): Promise<Notification> {
    const { userId, ...data } = createNotificationDto;

    const user = await this.userService.findOneById(userId);
    console.log('User found:', user);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (data.type === 'email') {
      this.notificationStrategy = new EmailService(this.configService);
      this.notificationStrategy.sendNotification(
        user.email,
        createNotificationDto.title,
        createNotificationDto.content,
      );
    } else if (data.type === 'push') {
      // this.notificationStrategy = new PushService(this.configService);
      this.notificationStrategy = new PushService(
        this.pushRabbitClient,
        this.configService,
      );
      this.notificationStrategy.sendNotification(
        user.expoMessageToken,
        createNotificationDto.title,
        createNotificationDto.content,
      );
    } else {
      throw new NotFoundException(`Notification type ${data.type} not found`);
    }

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      receiver: user,
    });

    return await this.notificationRepository.save(notification);
  }

  async findByIdUser(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<{
    total: number;
    data: Notification[];
  }> {
    const [data, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.receiverId = :userId', { userId })
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    const result = { total, data };
    return result;
  }
}
