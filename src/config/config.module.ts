import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
    }),
    CloudinaryModule,
  ],
  exports: [CloudinaryModule],
})
export class ConfigModule {}
