// upload.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CloudinaryService } from './cloudinary.config';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private cloudinaryService: CloudinaryService) {}

  /**
   * Endpoint para subir un archivo general
   * @param file - El archivo a subir
   * @returns La información del archivo subido
   */
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    try {
      const result = await this.cloudinaryService.uploadFile(file);
      
      return {
        filename: result.public_id,
        originalName: file.originalname,
        path: result.secure_url,
        mimeType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      throw new BadRequestException(`Error al subir el archivo: ${error.message}`);
    }
  }

  /**
   * Endpoint para subir un archivo adjunto a una tarea específica
   * @param file - El archivo a subir
   * @param taskId - ID de la tarea
   * @returns La información del archivo subido
   */

@UseGuards(AuthGuard)
@Post('task/:taskId')
@UseInterceptors(FileInterceptor('file'))
async uploadTaskAttachment(
  @UploadedFile() file: Express.Multer.File,
  @Param('taskId', ParseIntPipe) taskId: number,
) {
  if (!file) {
    throw new BadRequestException('No se ha proporcionado ningún archivo');
  }

  try {
    // Limpiar el nombre del archivo para evitar problemas
    const originalName = file.originalname.replace(/[^\w\s.-]/g, '');
    
    const result = await this.cloudinaryService.uploadTaskAttachment(file, taskId);
    
    return {
      filename: result.public_id,
      originalName: originalName, // Usar el nombre limpio
      path: result.secure_url,
      mimeType: file.mimetype,
      size: file.size,
    };
  } catch (error) {
    throw new BadRequestException(`Error al subir el archivo adjunto: ${error.message}`);
  }
}
}