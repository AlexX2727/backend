import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de tareas
 * Contiene la lógica de negocio para crear, leer, actualizar y eliminar tareas
 */
@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva tarea en la base de datos
   * @param createTaskDto - Datos de la tarea a crear
   * @returns La tarea creada con su información
   */
  async create(createTaskDto: CreateTaskDto) {
    const { project_id, assignee_id, ...rest } = createTaskDto;
    
    try {
      // Verificar que el proyecto existe
      const project = await this.prisma.project.findUnique({
        where: { id: project_id }
      });
      
      if (!project) {
        throw new BadRequestException(`Proyecto con ID ${project_id} no encontrado`);
      }
      
      // Si se proporciona un asignado, verificar que existe y es miembro del proyecto
      if (assignee_id) {
        // Verificar que el usuario existe
        const userExists = await this.prisma.user.findUnique({
          where: { id: assignee_id }
        });
        
        if (!userExists) {
          throw new BadRequestException(`Usuario con ID ${assignee_id} no encontrado`);
        }
        
        // Verificar que el usuario es miembro del proyecto o es el propietario
        const isMember = await this.prisma.projectMember.findFirst({
          where: {
            project_id,
            user_id: assignee_id,
          }
        });
        
        if (!isMember && assignee_id !== project.owner_id) {
          throw new BadRequestException(`El usuario con ID ${assignee_id} no es miembro del proyecto`);
        }
      }
      
      // Crear la tarea
      return await this.prisma.task.create({
        data: {
          ...rest,
          project: {
            connect: {
              id: project_id,
            },
          },
          ...(assignee_id && {
            assignee: {
              connect: {
                id: assignee_id,
              },
            },
          }),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            }
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
   * Obtiene todas las tareas registradas
   * @returns Lista de todas las tareas
   */
  async findAll() {
    return this.prisma.task.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          }
        }
      },
    });
  }

  /**
   * Obtiene todas las tareas de un proyecto específico
   * @param projectId - ID del proyecto
   * @returns Lista de tareas del proyecto
   */
  async findByProject(projectId: number) {
    // Verificar que el proyecto existe
    const projectExists = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!projectExists) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }
    
    return this.prisma.task.findMany({
      where: { project_id: projectId },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Obtiene todas las tareas asignadas a un usuario específico
   * @param userId - ID del usuario asignado
   * @returns Lista de tareas asignadas al usuario
   */
  async findByAssignee(userId: number) {
    // Verificar que el usuario existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userExists) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    return this.prisma.task.findMany({
      where: { assignee_id: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          }
        }
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  /**
   * Busca una tarea específica por su ID
   * @param id - ID de la tarea a buscar
   * @returns Información de la tarea solicitada
   */
  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          }
        },
        attachments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              }
            }
          }
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }

    return task;
  }

  /**
   * Actualiza la información de una tarea existente
   * @param id - ID de la tarea a actualizar
   * @param updateTaskDto - Datos a actualizar de la tarea
   * @returns La tarea con la información actualizada
   * @throws NotFoundException si la tarea no existe
   */
  async update(id: number, updateTaskDto: UpdateTaskDto) {
    // Verificar que la tarea existe
    const task = await this.findOne(id);
    
    const { project_id, assignee_id, ...rest } = updateTaskDto;
    
    try {
      // Preparar el objeto de datos para la actualización
      const data: any = { ...rest };
      
      // No permitimos cambiar el proyecto
      if (project_id) {
        throw new BadRequestException('No se puede cambiar el proyecto de una tarea existente');
      }
      
      // Si se proporciona un nuevo asignado, verificar que existe
      if (assignee_id) {
        // Verificar que el usuario existe
        const userExists = await this.prisma.user.findUnique({
          where: { id: assignee_id }
        });
        
        if (!userExists) {
          throw new BadRequestException(`Usuario con ID ${assignee_id} no encontrado`);
        }
        
        // Verificar que el usuario es miembro del proyecto
        const isMember = await this.prisma.projectMember.findFirst({
          where: {
            project_id: task.project_id,
            user_id: assignee_id,
          }
        });
        
        // Obtener el proyecto para verificar el propietario
        const project = await this.prisma.project.findUnique({
          where: { id: task.project_id }
        });
        
        // Verificar que el proyecto existe
        if (!project) {
          throw new BadRequestException(`Proyecto con ID ${task.project_id} no encontrado`);
        }
        
        if (!isMember && assignee_id !== project.owner_id) {
          throw new BadRequestException(`El usuario con ID ${assignee_id} no es miembro del proyecto`);
        }
        
        data.assignee = {
          connect: {
            id: assignee_id,
          },
        };
      }
      
      // Si se marca como completada y no hay fecha de completado, establecerla
      if (data.status === 'Done' && !data.completedAt) {
        data.completedAt = new Date();
      }
      
      // Actualizar la tarea en la base de datos
      return await this.prisma.task.update({
        where: { id },
        data,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            }
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
   * Elimina una tarea de la base de datos
   * @param id - ID de la tarea a eliminar
   * @returns Información de la tarea eliminada
   * @throws NotFoundException si la tarea no existe
   */
  async remove(id: number) {
    // Verificar que la tarea existe antes de eliminarla
    await this.findOne(id);
    
    try {
      // Eliminar la tarea de la base de datos
      return await this.prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      // Manejar posibles errores de restricciones de integridad
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('No se puede eliminar la tarea porque tiene registros relacionados (comentarios o adjuntos)');
        }
      }
      throw error;
    }
  }
}

