import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de comentarios de tareas
 * Contiene la lógica de negocio para crear, leer, actualizar y eliminar comentarios
 */
@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo comentario en una tarea
   * @param createCommentDto - Datos del comentario a crear
   * @returns El comentario creado con información del usuario y la tarea
   */
  async create(createCommentDto: CreateCommentDto) {
    const { task_id, user_id, content } = createCommentDto;
    
    try {
      // Verificar que la tarea existe
      const taskExists = await this.prisma.task.findUnique({
        where: { id: task_id }
      });
      
      if (!taskExists) {
        throw new BadRequestException(`Tarea con ID ${task_id} no encontrada`);
      }
      
      // Verificar que el usuario existe
      const userExists = await this.prisma.user.findUnique({
        where: { id: user_id }
      });
      
      if (!userExists) {
        throw new BadRequestException(`Usuario con ID ${user_id} no encontrado`);
      }
      
      // Crear el comentario
      return await this.prisma.comment.create({
        data: {
          content,
          task: {
            connect: {
              id: task_id,
            },
          },
          user: {
            connect: {
              id: user_id,
            },
          },
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            }
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los comentarios registrados
   * @returns Lista de todos los comentarios
   */
  async findAll() {
    return this.prisma.comment.findMany({
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene todos los comentarios de una tarea específica
   * @param taskId - ID de la tarea
   * @returns Lista de comentarios de la tarea
   */
  async findByTask(taskId: number) {
    // Verificar que la tarea existe
    const taskExists = await this.prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!taskExists) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }
    
    return this.prisma.comment.findMany({
      where: { task_id: taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca un comentario específico por su ID
   * @param id - ID del comentario a buscar
   * @returns Información del comentario solicitado
   */
  async findOne(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          }
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comment;
  }

  /**
   * Actualiza la información de un comentario existente
   * @param id - ID del comentario a actualizar
   * @param updateCommentDto - Datos a actualizar del comentario
   * @returns El comentario con la información actualizada
   * @throws NotFoundException si el comentario no existe
   */
  async update(id: number, updateCommentDto: UpdateCommentDto) {
    // Verificar que el comentario existe
    await this.findOne(id);
    
    // Solo permitimos actualizar el contenido del comentario
    const { content } = updateCommentDto;
    
    try {
      // Actualizar el comentario en la base de datos
      return await this.prisma.comment.update({
        where: { id },
        data: { content },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            }
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un comentario de la base de datos
   * @param id - ID del comentario a eliminar
   * @returns Información del comentario eliminado
   * @throws NotFoundException si el comentario no existe
   */
  async remove(id: number) {
    // Verificar que el comentario existe antes de eliminarlo
    await this.findOne(id);
    
    try {
      // Eliminar el comentario de la base de datos
      return await this.prisma.comment.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }
}
