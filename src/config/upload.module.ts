// upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { CloudinaryModule } from './cloudinary.config';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [CloudinaryModule, PrismaModule],
  controllers: [UploadController],
})
export class UploadModule {}