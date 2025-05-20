import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Interfaz para los datos de proyectos activos en el dashboard
 */
// Updated interface definitions to accept null values
export interface ActiveProjectsMetric {
  count: number;
  projects: {
    id: number;
    name: string;
    description?: string | null;
    status: string;
    owner: {
      id: number;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      avatar?: string | null;
    };
    taskCount: number;
    memberCount: number;
  }[];
}

export interface PendingTasksMetric {
  count: number;
  tasks: {
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string | null; // Cambiado a string | null
    project: {
      id: number;
      name: string;
    };
    assignee?: {
      id: number;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      avatar?: string | null;
    };
  }[];
}

export interface CompletedTasksMetric {
  count: number;
  tasks: {
    id: number;
    title: string;
    completedAt?: string | null; // Cambiado a string | null
    project: {
      id: number;
      name: string;
    };
    assignee?: {
      id: number;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      avatar?: string | null;
    };
  }[];
}

export interface RecentProjectsMetric {
  projects: {
    id: number;
    name: string;
    description?: string | null;
    status: string;
    createdAt: Date;
    owner: {
      id: number;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      avatar?: string | null;
    };
  }[];
}

export interface RecentActivityMetric {
  activities: (
    | {
        type: 'task_created' | 'task_updated';
        id: number;
        title: string;
        projectId: number;
        projectName: string;
        userId: number;
        userName: string;
        userAvatar?: string | null;
        timestamp: Date;
      }
    | {
        type: 'comment_added';
        taskId: number;
        taskTitle: string;
        projectId: number;
        projectName: string;
        userId: number;
        userName: string;
        userAvatar?: string | null;
        timestamp: Date;
      }
    | {
        type: 'attachment_added';
        taskId: number;
        taskTitle: string;
        projectId: number;
        projectName: string;
        userId: number;
        userName: string;
        userAvatar?: string | null;
        timestamp: Date;
      }
  )[];
}

/**
 * Interfaz para los datos de colaboradores por tarea en el dashboard
 */
export interface TaskCollaboratorsMetric {
  tasks: {
    id: number;
    title: string;
    collaboratorCount: number;
    project: {
      id: number;
      name: string;
    };
  }[];
}


/**
 * Interfaz para todos los datos combinados del dashboard
 */
export interface DashboardMetrics {
  activeProjects: ActiveProjectsMetric;
  pendingTasks: PendingTasksMetric;
  completedTasks: CompletedTasksMetric;
  taskCollaborators: TaskCollaboratorsMetric;
  recentProjects: RecentProjectsMetric;
  recentActivity: RecentActivityMetric;
}

/**
 * Servicio para la obtención de métricas para el dashboard
 * Proporciona métodos para consultar diferentes aspectos del sistema
 * como proyectos activos, tareas pendientes, etc.
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene el conteo y lista de proyectos activos
   * @param limit Límite opcional de resultados (por defecto 5)
   * @returns Información sobre proyectos activos
   */
  async getActiveProjects(limit = 5): Promise<ActiveProjectsMetric> {
    try {
      // Obtener el conteo total de proyectos activos
      const count = await this.prisma.project.count({
        where: {
          status: 'Active',
        },
      });

      // Obtener la lista de proyectos activos con información adicional
      const projects = await this.prisma.project.findMany({
        where: {
          status: 'Active',
        },
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              members: true,
            },
          },
        },
      });

      // Transformar los resultados al formato requerido
      return {
        count,
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          owner: project.owner ? {
            id: project.owner.id,
            firstName: project.owner.firstName,
            lastName: project.owner.lastName,
            username: project.owner.username,
            avatar: project.owner.avatar,
          } : {
            id: 0,
            firstName: 'Usuario',
            lastName: 'Desconocido',
          },
          taskCount: project._count.tasks,
          memberCount: project._count.members,
        })),
      };
    } catch (error) {
      console.error('Error al obtener proyectos activos:', error);
      throw new Error('Error al obtener proyectos activos');
    }
  }

  /**
   * Obtiene el conteo y lista de tareas pendientes
   * @param limit Límite opcional de resultados (por defecto 10)
   * @returns Información sobre tareas pendientes
   */
  async getPendingTasks(limit = 10): Promise<PendingTasksMetric> {
    try {
      // Obtener el conteo total de tareas pendientes
      const count = await this.prisma.task.count({
        where: {
          status: {
            not: 'Done',
          },
        },
      });

      // Obtener la lista de tareas pendientes con información adicional
      const tasks = await this.prisma.task.findMany({
        where: {
          status: {
            not: 'Done',
          },
        },
        take: limit,
        orderBy: [
          {
            priority: 'desc', // Prioridad alta primero
          },
          {
            dueDate: 'asc', // Fecha de vencimiento más cercana primero
          },
        ],
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Transformar los resultados al formato requerido
      return {
        count,
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          project: {
            id: task.project.id,
            name: task.project.name,
          },
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                firstName: task.assignee.firstName,
                lastName: task.assignee.lastName,
                username: task.assignee.username,
                avatar: task.assignee.avatar,
              }
            : undefined,
        })),
      };
    } catch (error) {
      console.error('Error al obtener tareas pendientes:', error);
      throw new Error('Error al obtener tareas pendientes');
    }
  }

  /**
   * Obtiene el conteo y lista de tareas completadas
   * @param limit Límite opcional de resultados (por defecto 5)
   * @returns Información sobre tareas completadas
   */
  async getCompletedTasks(limit = 5): Promise<CompletedTasksMetric> {
    try {
      // Obtener el conteo total de tareas completadas
      const count = await this.prisma.task.count({
        where: {
          status: 'Done',
        },
      });

      // Obtener la lista de tareas completadas con información adicional
      const tasks = await this.prisma.task.findMany({
        where: {
          status: 'Done',
        },
        take: limit,
        orderBy: {
          completedAt: 'desc', // Completadas más recientemente primero
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Transformar los resultados al formato requerido
      return {
        count,
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          completedAt: task.completedAt,
          project: {
            id: task.project.id,
            name: task.project.name,
          },
          assignee: task.assignee
            ? {
                id: task.assignee.id,
                firstName: task.assignee.firstName,
                lastName: task.assignee.lastName,
                username: task.assignee.username,
                avatar: task.assignee.avatar,
              }
            : undefined,
        })),
      };
    } catch (error) {
      console.error('Error al obtener tareas completadas:', error);
      throw new Error('Error al obtener tareas completadas');
    }
  }

  /**
   * Obtiene información sobre los colaboradores asignados a tareas
   * Calcula cuántos colaboradores están trabajando en cada tarea
   * @param limit Límite opcional de resultados (por defecto 10)
   * @returns Información sobre colaboradores por tarea
   */
  async getTaskCollaboratorsCount(limit = 10): Promise<TaskCollaboratorsMetric> {
    try {
      // Obtener tareas con información de proyecto y asignaciones
      const tasks = await this.prisma.task.findMany({
        take: limit,
        where: {
          assignee_id: {
            not: null,
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              members: {
                select: {
                  user_id: true,
                },
              },
            },
          },
          comments: {
            select: {
              user_id: true,
            },
          },
        },
      });

      // Transformar los resultados al formato requerido
      return {
        tasks: tasks.map((task) => {
          // Obtener los IDs únicos de usuarios que han comentado en la tarea
          const commentUserIds = new Set(task.comments.map((comment) => comment.user_id));
          
          // Obtener los IDs de miembros del proyecto
          const projectMemberIds = new Set(task.project.members.map(member => member.user_id));
          
          // Contar colaboradores únicos (miembros del proyecto que han comentado 
          // y usuarios externos que han comentado)
          // Primero contamos los miembros del proyecto
          const collaboratorCount = projectMemberIds.size + 
            // Luego sumamos usuarios que han comentado pero no son miembros del proyecto
            [...commentUserIds].filter(userId => !projectMemberIds.has(userId)).length;

          return {
            id: task.id,
            title: task.title,
            collaboratorCount,
            project: {
              id: task.project.id,
              name: task.project.name,
            },
          };
        }),
      };
    } catch (error) {
      console.error('Error al obtener conteo de colaboradores por tarea:', error);
      throw new Error('Error al obtener conteo de colaboradores por tarea');
    }
  }

  /**
   * Obtiene los proyectos más recientes creados en el sistema
   * @param limit Límite opcional de resultados (por defecto 5)
   * @returns Información sobre proyectos recientes
   */
  async getRecentProjects(limit = 5): Promise<RecentProjectsMetric> {
    try {
      // Obtener los proyectos más recientes
      const projects = await this.prisma.project.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc', // Más recientes primero
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Transformar los resultados al formato requerido
      return {
        projects: projects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
          owner: {
            id: project.owner.id,
            firstName: project.owner.firstName,
            lastName: project.owner.lastName,
            username: project.owner.username,
            avatar: project.owner.avatar,
          },
        })),
      };
    } catch (error) {
      console.error('Error al obtener proyectos recientes:', error);
      throw new Error('Error al obtener proyectos recientes');
    }
  }

  /**
   * Obtiene la actividad reciente en el sistema
   * Incluye tareas creadas o actualizadas, comentarios y adjuntos
   * @param limit Límite opcional de resultados (por defecto 10)
   * @returns Información sobre actividad reciente
   */
  async getRecentActivity(limit = 10): Promise<RecentActivityMetric> {
    try {
      // Obtener tareas recientemente creadas o actualizadas
      const recentTasks = await this.prisma.task.findMany({
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Obtener comentarios recientes
      const recentComments = await this.prisma.comment.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Obtener adjuntos recientes
      const recentAttachments = await this.prisma.attachment.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Crear actividades a partir de tareas
      const taskActivities = recentTasks.map((task) => ({
        type: task.completedAt ? 'task_updated' as const : 'task_created' as const,
        id: task.id,
        title: task.title,
        projectId: task.project.id,
        projectName: task.project.name,
        userId: task.assignee?.id || 0,
        userName: task.assignee 
          ? `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.username || 'Usuario'
          : 'Sistema',
        userAvatar: task.assignee?.avatar,
        timestamp: task.updatedAt,
      }));

      // Crear actividades a partir de comentarios
      const commentActivities = recentComments.map((comment) => ({
        type: 'comment_added' as const,
        taskId: comment.task.id,
        taskTitle: comment.task.title,
        projectId: comment.task.project.id,
        projectName: comment.task.project.name,
        userId: comment.user.id,
        userName: `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim() || comment.user.username || '',
        userAvatar: comment.user.avatar,
        timestamp: comment.createdAt,
      }));

      // Crear actividades a partir de adjuntos
      const attachmentActivities = recentAttachments.map((attachment) => ({
        type: 'attachment_added' as const,
        taskId: attachment.task.id,
        taskTitle: attachment.task.title,
        projectId: attachment.task.project.id,
        projectName: attachment.task.project.name,
        userId: attachment.user.id,
        userName: `${attachment.user.firstName || ''} ${attachment.user.lastName || ''}`.trim() || attachment.user.username || '',
        userAvatar: attachment.user.avatar,
        timestamp: attachment.createdAt,
      }));

      // Combinar y ordenar todas las actividades por fecha
      const allActivities = [...taskActivities, ...commentActivities, ...attachmentActivities]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

      return {
        activities: allActivities,
      };
    } catch (error) {
      console.error('Error al obtener actividad reciente:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Error de base de datos al obtener actividad reciente: ${error.message}`);
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new Error(`Error de validación al obtener actividad reciente: ${error.message}`);
      } else {
        throw new Error(`Error al obtener actividad reciente: ${error.message || 'Error desconocido'}`);
      }
    }
  }

  /**
   * Obtiene todas las métricas del dashboard en una sola llamada
   * @returns Objeto con todas las métricas del dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Obtener todas las métricas en paralelo para mejorar el rendimiento
      const [
        activeProjects,
        pendingTasks,
        completedTasks,
        taskCollaborators,
        recentProjects,
        recentActivity
      ] = await Promise.all([
        this.getActiveProjects(),
        this.getPendingTasks(),
        this.getCompletedTasks(),
        this.getTaskCollaboratorsCount(),
        this.getRecentProjects(),
        this.getRecentActivity()
      ]);

      // Combinar todas las métricas en un solo objeto
      return {
        activeProjects,
        pendingTasks,
        completedTasks,
        taskCollaborators,
        recentProjects,
        recentActivity
      };
    } catch (error) {
      console.error('Error al obtener métricas del dashboard:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Error de base de datos al obtener métricas del dashboard: ${error.message}`);
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new Error(`Error de validación al obtener métricas del dashboard: ${error.message}`);
      } else {
        throw new Error(`Error al obtener métricas del dashboard: ${error.message || 'Error desconocido'}`);
      }
    }
  }
}
