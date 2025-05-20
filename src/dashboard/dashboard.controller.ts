import { Controller, Get, Query, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { 
  ActiveProjectsMetric, 
  PendingTasksMetric, 
  CompletedTasksMetric, 
  TaskCollaboratorsMetric, 
  RecentProjectsMetric, 
  RecentActivityMetric,
  DashboardMetrics
} from './dashboard.service';

/**
 * Controlador para gestionar las solicitudes relacionadas con el dashboard
 * Expone endpoints para obtener métricas y estadísticas del sistema
 */
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Obtiene todas las métricas del dashboard en una sola respuesta
   * @returns Todas las métricas combinadas
   */
  @Get()
  async getAllMetrics(): Promise<DashboardMetrics> {
    try {
      return await this.dashboardService.getDashboardMetrics();
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener métricas del dashboard',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre proyectos activos
   * @param limit Número máximo de proyectos a retornar
   * @returns Métricas de proyectos activos
   */
  @Get('active-projects')
  async getActiveProjects(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<ActiveProjectsMetric> {
    try {
      return await this.dashboardService.getActiveProjects(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener proyectos activos',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre tareas pendientes
   * @param limit Número máximo de tareas a retornar
   * @returns Métricas de tareas pendientes
   */
  @Get('pending-tasks')
  async getPendingTasks(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PendingTasksMetric> {
    try {
      return await this.dashboardService.getPendingTasks(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener tareas pendientes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre tareas completadas
   * @param limit Número máximo de tareas a retornar
   * @returns Métricas de tareas completadas
   */
  @Get('completed-tasks')
  async getCompletedTasks(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<CompletedTasksMetric> {
    try {
      return await this.dashboardService.getCompletedTasks(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener tareas completadas',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre colaboradores por tarea
   * @param limit Número máximo de tareas a analizar
   * @returns Métricas de colaboradores por tarea
   */
  @Get('task-collaborators')
  async getTaskCollaborators(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<TaskCollaboratorsMetric> {
    try {
      return await this.dashboardService.getTaskCollaboratorsCount(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener datos de colaboradores por tarea',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre proyectos recientes
   * @param limit Número máximo de proyectos a retornar
   * @returns Métricas de proyectos recientes
   */
  @Get('recent-projects')
  async getRecentProjects(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<RecentProjectsMetric> {
    try {
      return await this.dashboardService.getRecentProjects(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener proyectos recientes',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Obtiene información sobre actividad reciente en el sistema
   * @param limit Número máximo de actividades a retornar
   * @returns Métricas de actividad reciente
   */
  @Get('recent-activity')
  async getRecentActivity(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<RecentActivityMetric> {
    try {
      return await this.dashboardService.getRecentActivity(limit);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener actividad reciente',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

