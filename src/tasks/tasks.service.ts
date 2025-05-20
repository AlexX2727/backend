import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(TasksService.name);

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
   * Obtiene tareas con múltiples opciones de filtrado
   * @param options - Opciones de filtrado (proyecto, asignado, etc.)
   * @returns Lista de tareas filtradas
   */
  async findTasksWithFilters(options: {
    projectId?: number;
    assigneeId?: number;
    myTasks?: boolean;
    userId?: number;
    status?: string;
    priority?: string;
  }) {
    const { projectId, assigneeId, myTasks, userId, status, priority } = options;
    
    // Construir las condiciones del where
    const where: Prisma.TaskWhereInput = {};
    
    // Filtrar por proyecto si se proporciona un projectId
    if (projectId) {
      where.project_id = projectId;
    }
    
    // Filtrar por asignado si se proporciona un assigneeId
    if (assigneeId) {
      where.assignee_id = assigneeId;
    }
    
    // Filtrar por "mis tareas" (tareas asignadas al usuario actual)
    if (myTasks && userId) {
      where.assignee_id = userId;
    }
    
    // Filtrar por estado si se proporciona
    if (status) {
      where.status = status;
    }
    
    // Filtrar por prioridad si se proporciona
    if (priority) {
      where.priority = priority;
    }
    
    return this.prisma.task.findMany({
      where,
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
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Obtiene los miembros del proyecto para poder asignar tareas
   * @param projectId - ID del proyecto
   * @returns Lista de miembros del proyecto, incluyendo el propietario
   */
  async getProjectMembers(projectId: number) {
    // Verificar que el proyecto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        }
      }
    });
    
    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }
    
    // Obtener los miembros del proyecto
    const members = await this.prisma.projectMember.findMany({
      where: { project_id: projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        }
      }
    });
    
    // Combinar el propietario con los miembros
    const ownerAsMember = {
      id: project.owner.id,
      firstName: project.owner.firstName,
      lastName: project.owner.lastName,
      email: project.owner.email,
      username: project.owner.username,
      avatar: project.owner.avatar,
      role: 'Owner'
    };
    
    const memberUsers = members.map(member => ({
      id: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      username: member.user.username,
      avatar: member.user.avatar,
      role: member.role
    }));
    
    // Asegurarse de que el propietario no se duplique
    const uniqueMembers = [ownerAsMember, ...memberUsers.filter(m => m.id !== project.owner.id)];
    
    return uniqueMembers;
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
  // tasks.service.ts - método update modificado
async update(id: number, updateTaskDto: UpdateTaskDto) {
  try {
    // Verificar que la tarea existe
    const taskExists = await this.prisma.task.findUnique({
      where: { id }
    });
    
    if (!taskExists) {
      throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    }
    
    // Log antes de procesar
    this.logger.log(`Actualizando tarea ${id} - Datos recibidos: ${JSON.stringify(updateTaskDto)}`);
    
    // Extraer los campos de updateTaskDto
    const { assignee_id, ...restData } = updateTaskDto;
    
    // Crear un objeto para actualización con todos los campos
    const updateData: Prisma.TaskUpdateInput = {};
    
    // Procesar cada campo individualmente
    Object.keys(restData).forEach(key => {
      if (restData[key] !== undefined) {
        updateData[key] = restData[key];
      }
    });
    
    // Manejar relación assignee de manera especial
    if (assignee_id !== undefined) {
      if (assignee_id === null) {
        // Si es null, desconectar la relación
        updateData.assignee = { disconnect: true };
        this.logger.log(`Desconectando asignado de la tarea ${id}`);
      } else {
        // Verificar que el usuario existe
        const userExists = await this.prisma.user.findUnique({
          where: { id: assignee_id }
        });
        
        if (!userExists) {
          throw new BadRequestException(`Usuario con ID ${assignee_id} no encontrado`);
        }
        
        // Conectar con el nuevo asignado
        updateData.assignee = {
          connect: { id: assignee_id }
        };
        this.logger.log(`Conectando tarea ${id} con asignado ${assignee_id}`);
      }
    }
    
    // Si se marca como completada y no hay fecha de completado, establecerla
    if (restData.status === 'Done' && !restData.completedAt) {
      updateData.completedAt = new Date().toISOString().split('T')[0];
    }
    
    // Log para depuración
    this.logger.log(`Datos finales para actualización de tarea ${id}: ${JSON.stringify(updateData)}`);
    
    // Actualizar la tarea en la base de datos
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: updateData,
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
    
    this.logger.log(`Tarea ${id} actualizada correctamente`);
    return updatedTask;
  } catch (error) {
    this.logger.error(`Error al actualizar tarea ${id}: ${error.message}`, error.stack);
    
    if (error instanceof BadRequestException || error instanceof NotFoundException) {
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
  // En tasks.service.ts - método remove modificado
async remove(id: number) {
  // Verificar que la tarea existe antes de eliminarla
  await this.findOne(id);
  
  try {
    // Primero, eliminar todos los comentarios asociados a la tarea
    await this.prisma.comment.deleteMany({
      where: { task_id: id }
    });
    
    // Luego, eliminar todos los adjuntos asociados a la tarea
    await this.prisma.attachment.deleteMany({
      where: { task_id: id }
    });
    
    this.logger.log(`Relaciones de tarea ${id} eliminadas (comentarios y adjuntos)`);
    
    // Finalmente, eliminar la tarea
    const deletedTask = await this.prisma.task.delete({
      where: { id },
    });
    
    this.logger.log(`Tarea ${id} eliminada correctamente`);
    return deletedTask;
  } catch (error) {
    // Manejar posibles errores de restricciones de integridad
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        this.logger.error(`Error de integridad referencial al eliminar tarea ${id}:`, error);
        throw new BadRequestException('No se puede eliminar la tarea porque tiene registros relacionados. Detalles: ' + error.message);
      }
    }
    
    this.logger.error(`Error al eliminar tarea ${id}:`, error);
    throw error;
  }
}
}