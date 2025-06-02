import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]), // Add your Message entity here
    UsersModule,
    RolesModule, // Import RolesModule if needed for role-based access control
    JwtModule,
  ],
  providers: [MessageResolver, MessageService, AuthGuard],
})
export class MessageModule {}
