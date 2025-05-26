import { Controller, Get, Query, ParseIntPipe, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard'; // Usando tu AuthGuard
import { Request } from 'express';
import { 
  ActiveProjectsMetric, 
  PendingTasksMetric, 
  CompletedTasksMetric, 
  TaskCollaboratorsMetric, 
  RecentProjectsMetric, 
  RecentActivityMetric,
  DashboardMetrics,
  ProjectProgressMetric
} from './dashboard.service';

// Interfaz para el usuario en el request basada en tu AuthService
interface AuthenticatedRequest extends Request {
  user: {
    userWithoutPassword: {
      id: number;
      email: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      phone?: string;
      role_id: number;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

/**
 * Controlador para gestionar las solicitudes relacionadas con el dashboard
 * Expone endpoints para obtener métricas y estadísticas del sistema filtradas por usuario
 */
@Controller('dashboard')
@UseGuards(AuthGuard) // Usando tu AuthGuard
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene todas las métricas del dashboard filtradas por el usuario logueado
   * @param req Request con información del usuario autenticado
   * @returns Todas las métricas combinadas del usuario
   */
  @Get()
  async getAllMetrics(@Req() req: AuthenticatedRequest): Promise<DashboardMetrics> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getDashboardMetrics(userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener métricas del dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre proyectos activos del usuario
   * @param req Request con información del usuario autenticado
   * @param limit Número máximo de proyectos a retornar
   * @returns Métricas de proyectos activos del usuario
   */
  @Get('active-projects')
  async getActiveProjects(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<ActiveProjectsMetric> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getActiveProjects(userId, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener proyectos activos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre tareas pendientes del usuario
   * @param req Request con información del usuario autenticado
   * @param limit Número máximo de tareas a retornar
   * @returns Métricas de tareas pendientes del usuario
   */
  @Get('pending-tasks')
  async getPendingTasks(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PendingTasksMetric> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getPendingTasks(userId, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener tareas pendientes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre tareas completadas del usuario
   * @param req Request con información del usuario autenticado
   * @param limit Número máximo de tareas a retornar
   * @returns Métricas de tareas completadas del usuario
   */
  @Get('completed-tasks')
  async getCompletedTasks(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<CompletedTasksMetric> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getCompletedTasks(userId, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener tareas completadas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre colaboradores por tarea del usuario
   * @param req Request con información del usuario autenticado
   * @param limit Número máximo de tareas a analizar
   * @returns Métricas de colaboradores por tarea del usuario
   */
  @Get('task-collaborators')
  async getTaskCollaborators(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<TaskCollaboratorsMetric> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getTaskCollaboratorsCount(userId, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener datos de colaboradores por tarea',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre proyectos recientes del usuario
   * @param req Request con información del usuario autenticado
   * @param limit Número máximo de proyectos a retornar
   * @returns Métricas de proyectos recientes del usuario
   */
  @Get('recent-projects')
  async getRecentProjects(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<RecentProjectsMetric> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getRecentProjects(userId, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener proyectos recientes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre actividad reciente del usuario
   * @param req Request con información del usuario autenticado
   * @param limit Número máximo de actividades a retornar
   * @returns Métricas de actividad reciente del usuario
   */
  @Get('recent-activity')
  async getRecentActivity(
    @Req() req: AuthenticatedRequest,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<RecentActivityMetric> {
    try {
      const userId = req.user.userWithoutPassword.id;
      return await this.dashboardService.getRecentActivity(userId, limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener actividad reciente',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
/**
 * Obtiene información sobre el progreso de proyectos del usuario
 * @param req Request con información del usuario autenticado
 * @param limit Número máximo de proyectos a retornar
 * @returns Métricas de progreso de proyectos del usuario
 */
@Get('project-progress')
async getProjectProgress(
  @Req() req: AuthenticatedRequest,
  @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
): Promise<ProjectProgressMetric> {
  try {
    const userId = req.user.userWithoutPassword.id;
    return await this.dashboardService.getProjectProgress(userId, limit);
  } catch (error) {
    throw new HttpException(
      error.message || 'Error al obtener progreso de proyectos',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

}