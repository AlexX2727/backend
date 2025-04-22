import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

/**
 * Módulo de Archivos Adjuntos
 * Gestiona las funcionalidades relacionadas con los archivos adjuntos de tareas
 */
@Module({
  imports: [PrismaModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}

