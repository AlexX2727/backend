import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Controlador para la gestión de comentarios y archivos adjuntos de tareas
 * Proporciona endpoints para crear, leer, actualizar y eliminar comentarios y adjuntos
 */
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /**
   * Endpoint para crear un nuevo comentario
   * Requiere autenticación
   * @param createCommentDto - Datos del comentario a crear
   * @returns El comentario creado con su información
   */
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  /**
   * Endpoint para obtener todos los comentarios
   * Requiere autenticación
   * @returns Lista de todos los comentarios registrados
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  /**
   * Endpoint para obtener los comentarios de una tarea específica
   * Requiere autenticación
   * @param taskId - ID de la tarea
   * @returns Lista de comentarios de la tarea
   */
  @UseGuards(AuthGuard)
  @Get('task/:taskId')
  findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.commentsService.findByTask(taskId);
  }

  /**
   * Endpoint para obtener un comentario específico por su ID
   * Requiere autenticación
   * @param id - ID del comentario a buscar
   * @returns Información del comentario solicitado
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOne(id);
  }

  /**
   * Endpoint para actualizar la información de un comentario
   * Requiere autenticación
   * @param id - ID del comentario a actualizar
   * @param updateCommentDto - Datos a actualizar del comentario
   * @returns El comentario con la información actualizada
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  /**
   * Endpoint para eliminar un comentario
   * Requiere autenticación
   * @param id - ID del comentario a eliminar
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.remove(id);
  }

  /**
   * ENDPOINTS PARA ARCHIVOS ADJUNTOS
   */

  /**
   * Endpoint para crear un nuevo archivo adjunto
   * Requiere autenticación
   * @param createAttachmentDto - Datos del archivo adjunto a crear
   * @returns El archivo adjunto creado con su información
   */
  @UseGuards(AuthGuard)
  @Post('attachments')
  createAttachment(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.commentsService.createAttachment(createAttachmentDto);
  }

  /**
   * Endpoint para obtener todos los archivos adjuntos
   * Requiere autenticación
   * @returns Lista de todos los archivos adjuntos registrados
   */
  @UseGuards(AuthGuard)
  @Get('attachments')
  findAllAttachments() {
    return this.commentsService.findAllAttachments();
  }

  /**
   * Endpoint para obtener los archivos adjuntos de una tarea específica
   * Requiere autenticación
   * @param taskId - ID de la tarea
   * @returns Lista de archivos adjuntos de la tarea
   */
  @UseGuards(AuthGuard)
  @Get('attachments/task/:taskId')
  findAttachmentsByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.commentsService.findAttachmentsByTask(taskId);
  }

  /**
   * Endpoint para obtener un archivo adjunto específico por su ID
   * Requiere autenticación
   * @param id - ID del archivo adjunto a buscar
   * @returns Información del archivo adjunto solicitado
   */
  @UseGuards(AuthGuard)
  @Get('attachments/:id')
  findOneAttachment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.findOneAttachment(id);
  }

  /**
   * Endpoint para actualizar la información de un archivo adjunto
   * Requiere autenticación
   * @param id - ID del archivo adjunto a actualizar
   * @param updateAttachmentDto - Datos a actualizar del archivo adjunto
   * @returns El archivo adjunto con la información actualizada
   */
  @UseGuards(AuthGuard)
  @Patch('attachments/:id')
  updateAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ) {
    return this.commentsService.updateAttachment(id, updateAttachmentDto);
  }

  /**
   * Endpoint para eliminar un archivo adjunto
   * Requiere autenticación
   * @param id - ID del archivo adjunto a eliminar
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete('attachments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAttachment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.removeAttachment(id);
  }

  /**
   * ENDPOINTS COMBINADOS
   */

  /**
   * Endpoint para obtener tanto los comentarios como los archivos adjuntos de una tarea
   * Requiere autenticación
   * @param taskId - ID de la tarea
   * @returns Objeto con comentarios y archivos adjuntos de la tarea
   */
  @UseGuards(AuthGuard)
  @Get('task/:taskId/all')
  getTaskCommentsAndAttachments(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.commentsService.getTaskCommentsAndAttachments(taskId);
  }
}