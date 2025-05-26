import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EmailService } from './email.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/config/cloudinary.config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule, 
    CloudinaryModule,
    ConfigModule,
    JwtModule.register({
      global: false, // Scope to this module only
      secret: process.env.SECRET,
      signOptions: { expiresIn: '1h' }, // Default expiration for password reset tokens
    }),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, EmailService],
  exports: [UsersService, EmailService],
})
export class UsersModule {}
