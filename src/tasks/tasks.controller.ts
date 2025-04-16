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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Controlador para la gestión de tareas
 * Proporciona endpoints para crear, leer, actualizar y eliminar tareas
 */
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Endpoint para crear una nueva tarea
   * Requiere autenticación
   * @param createTaskDto - Datos de la tarea a crear
   * @returns La tarea creada con su información
   */
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
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
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, updateTaskDto);
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}

