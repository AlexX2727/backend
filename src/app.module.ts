import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectMembersModule } from './project-members/project-members.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CloudinaryModule } from './config/cloudinary.config';
import { UploadModule } from './config/upload.module';

@Module({
  imports: [
    ConfigModule, // Added first as other modules might depend on it
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ProjectMembersModule,
    TasksModule,
    CommentsModule,
    AttachmentsModule,
    DashboardModule,
    CloudinaryModule, // Add Cloudinary module
    UploadModule, // Add Upload module
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}