import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de archivos adjuntos
 * Contiene la lógica de negocio para crear, leer y eliminar archivos adjuntos
 */
@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo archivo adjunto
   * @param createAttachmentDto - Datos del archivo adjunto a crear
   * @returns El archivo adjunto creado con información del usuario y la tarea
   */
  async create(createAttachmentDto: CreateAttachmentDto) {
    const { task_id, user_id, filename, originalName, path, mimeType, size } = createAttachmentDto;
    
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
      
      // Crear el archivo adjunto
      return await this.prisma.attachment.create({
        data: {
          filename,
          originalName,
          path,
          mimeType,
          size,
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
   * Obtiene todos los archivos adjuntos
   * @returns Lista de todos los archivos adjuntos
   */
  async findAll() {
    return this.prisma.attachment.findMany({
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
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene todos los archivos adjuntos de una tarea específica
   * @param taskId - ID de la tarea
   * @returns Lista de archivos adjuntos de la tarea
   */
  async findByTask(taskId: number) {
    // Verificar que la tarea existe
    const taskExists = await this.prisma.task.findUnique({
      where: { id: taskId }
    });
    
    if (!taskExists) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }
    
    return this.prisma.attachment.findMany({
      where: { task_id: taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca un archivo adjunto específico por su ID
   * @param id - ID del archivo adjunto a buscar
   * @returns Información del archivo adjunto solicitado
   */
  async findOne(id: number) {
    const attachment = await this.prisma.attachment.findUnique({
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
          }
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException(`Archivo adjunto con ID ${id} no encontrado`);
    }

    return attachment;
  }

  /**
   * Elimina un archivo adjunto de la base de datos
   * @param id - ID del archivo adjunto a eliminar
   * @returns Información del archivo adjunto eliminado
   * @throws NotFoundException si el archivo adjunto no existe
   */
  async remove(id: number) {
    // Obtener la información del archivo adjunto antes de eliminarlo
    const attachment = await this.findOne(id);
    
    try {
      // Eliminar el archivo adjunto de la base de datos
      await this.prisma.attachment.delete({
        where: { id },
      });
      
      // Devolvemos la información del archivo que se eliminó
      // Esto puede ser útil para eliminar físicamente el archivo del almacenamiento
      return attachment;
    } catch (error) {
      throw error;
    }
  }
}

