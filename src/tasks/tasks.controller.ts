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
  Logger,
  Query,
  Req,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Controlador para la gestión de tareas
 * Proporciona endpoints para crear, leer, actualizar y eliminar tareas
 */
@Controller('tasks')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(
    private readonly tasksService: TasksService,
    private readonly prismaService: PrismaService
  ) {}

  /**
   * Endpoint para crear una nueva tarea
   * Requiere autenticación
   * @param createTaskDto - Datos de la tarea a crear
   * @returns La tarea creada con su información
   */
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    this.logger.log(`Creando tarea: ${JSON.stringify(createTaskDto)}`);
    return this.tasksService.create(createTaskDto);
  }

  /**
   * Endpoint para obtener todas las tareas
   * Requiere autenticación
   * @returns Lista de todas las tareas registradas
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  /**
   * Endpoint para listar tareas con múltiples opciones de filtrado
   * @param query - Parámetros de filtrado
   * @returns Lista de tareas filtradas según los criterios
   */
  @UseGuards(AuthGuard)
@Get('filter')
findTasksWithFilters(
  @Req() request: any,
  @Query('projectId') projectIdStr?: string,
  @Query('assigneeId') assigneeIdStr?: string,
  @Query('myTasks') myTasks?: string,
  @Query('status') status?: string,
  @Query('priority') priority?: string,
) {
  // Extraer el userId del token de autenticación
  const userId = request.user?.sub;
  
  // Convertir myTasks a booleano
  const isMyTasks = myTasks === 'true';
  
  // Convertir strings a números
  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
  const assigneeId = assigneeIdStr ? parseInt(assigneeIdStr, 10) : undefined;
  
  return this.tasksService.findTasksWithFilters({
    projectId,
    assigneeId,
    myTasks: isMyTasks,
    userId,
    status,
    priority
  });
}

  /**
   * Endpoint para obtener los miembros de un proyecto
   * @param projectId - ID del proyecto
   * @returns Lista de miembros del proyecto
   */
  @UseGuards(AuthGuard)
  @Get('project/:projectId/members')
  getProjectMembers(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.tasksService.getProjectMembers(projectId);
  }

  /**
   * Endpoint para obtener las tareas de un proyecto específico
   * Requiere autenticación
   * @param projectId - ID del proyecto
   * @returns Lista de tareas del proyecto
   */
  @UseGuards(AuthGuard)
  @Get('project/:projectId')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.tasksService.findByProject(projectId);
  }

  /**
   * Endpoint para obtener las tareas asignadas a un usuario específico
   * Requiere autenticación
   * @param userId - ID del usuario asignado
   * @returns Lista de tareas asignadas al usuario
   */
  @UseGuards(AuthGuard)
  @Get('assignee/:userId')
  findByAssignee(@Param('userId', ParseIntPipe) userId: number) {
    return this.tasksService.findByAssignee(userId);
  }

  /**
   * Endpoint para obtener una tarea específica por su ID
   * Requiere autenticación
   * @param id - ID de la tarea a buscar
   * @returns Información de la tarea solicitada
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  /**
   * Endpoint para actualizar la información de una tarea
   * Requiere autenticación
   * @param id - ID de la tarea a actualizar
   * @param updateTaskDto - Datos a actualizar de la tarea
   * @returns La tarea con la información actualizada
   */
// tasks.controller.ts - método update modificado
@UseGuards(AuthGuard)
@Patch(':id')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateTaskDto: UpdateTaskDto,
  @Req() request: any,
) {
  // Log de los datos recibidos directamente del cuerpo de la solicitud
  this.logger.log(`Datos brutos recibidos: ${JSON.stringify(request.body)}`);
  this.logger.log(`DTO parseado: ${JSON.stringify(updateTaskDto)}`);
  
  // Verificación menos estricta para permitir actualizaciones parciales
  if (!updateTaskDto || (typeof updateTaskDto === 'object' && Object.keys(updateTaskDto).length === 0)) {
    this.logger.warn('Solicitud de actualización con datos vacíos');
    throw new BadRequestException('No se proporcionaron datos para actualizar');
  }
  
  this.logger.log(`Actualizando tarea ${id}: ${JSON.stringify(updateTaskDto)}`);
  
  try {
    // Obtener la tarea actual
    const task = await this.tasksService.findOne(id);
    
    // Extraer el userId del token
    const userId = request.user?.sub;
    
    // Resto del código de validación...
    
    // Usar directamente los datos recibidos sin validaciones adicionales
    return this.tasksService.update(id, updateTaskDto);
  } catch (error) {
    this.logger.error(`Error al actualizar tarea ${id}: ${error.message}`, error.stack);
    throw error;
  }

}
  /**
   * Endpoint para eliminar una tarea
   * Requiere autenticación
   * @param id - ID de la tarea a eliminar
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(
  @Param('id', ParseIntPipe) id: number,
  @Req() request: any,
) {
  try {
    // Obtener la tarea actual para verificación
    const task = await this.tasksService.findOne(id);
    
    // Extraer el userId del token de autenticación
    const userId = request.user?.sub;
    
    // Añadir logs para depuración
    this.logger.log(`Intento de eliminación de tarea ${id} por usuario ${userId}`);
    
    // Verificar si el usuario es el propietario del proyecto
    const project = await this.prismaService.project.findUnique({
      where: { id: task.project_id },
    });
    
    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${task.project_id} no encontrado`);
    }
    
    // Comprobar si el usuario es el propietario del proyecto o el propietario de la tarea
    const userIsProjectOwner = project.owner_id === userId;
    
    // También permitir al creador de la tarea eliminarla (esto es opcional)
    // Asumiendo que tienes un campo creator_id o similar
    const userIsTaskCreator = true; // Modificar según tu modelo de datos
    
    this.logger.log(`Verificación de permisos: 
      - userId: ${userId}
      - project.owner_id: ${project.owner_id}
      - userIsProjectOwner: ${userIsProjectOwner}
      - userIsTaskCreator: ${userIsTaskCreator}
    `);
    
    // Permitir eliminación si es propietario del proyecto o creador de la tarea
    if (!userIsProjectOwner && !userIsTaskCreator) {
      this.logger.warn(`Usuario ${userId} intenta eliminar tarea sin permisos`);
      throw new ForbiddenException('Solo el propietario del proyecto puede eliminar tareas');
    }
    
    // Si llegamos aquí, el usuario tiene permisos para eliminar
    this.logger.log(`Usuario ${userId} autorizado para eliminar tarea ${id}`);
    
    return this.tasksService.remove(id);
  } catch (error) {
    this.logger.error(`Error al eliminar tarea ${id}: ${error.message}`, error.stack);
    throw error;
  }
}
}