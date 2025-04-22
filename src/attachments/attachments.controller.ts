import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Controlador para la gestión de archivos adjuntos
 * Proporciona endpoints para crear, leer y eliminar archivos adjuntos
 */
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  /**
   * Endpoint para crear un nuevo archivo adjunto
   * Requiere autenticación
   * @param createAttachmentDto - Datos del archivo adjunto a crear
   * @returns El archivo adjunto creado con su información
   */
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentsService.create(createAttachmentDto);
  }

  /**
   * Endpoint para obtener todos los archivos adjuntos
   * Requiere autenticación
   * @returns Lista de todos los archivos adjuntos
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.attachmentsService.findAll();
  }

  /**
   * Endpoint para obtener los archivos adjuntos de una tarea específica
   * Requiere autenticación
   * @param taskId - ID de la tarea
   * @returns Lista de archivos adjuntos de la tarea
   */
  @UseGuards(AuthGuard)
  @Get('task/:taskId')
  findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.attachmentsService.findByTask(taskId);
  }

  /**
   * Endpoint para obtener un archivo adjunto específico por su ID
   * Requiere autenticación
   * @param id - ID del archivo adjunto a buscar
   * @returns Información del archivo adjunto solicitado
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findOne(id);
  }

  /**
   * Endpoint para eliminar un archivo adjunto
   * Requiere autenticación
   * @param id - ID del archivo adjunto a eliminar
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.remove(id);
  }
}

