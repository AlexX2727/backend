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
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Controlador para la gestión de miembros de proyectos
 * Proporciona endpoints para agregar, obtener, actualizar y eliminar miembros de proyectos
 */
@Controller('project-members')
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  /**
   * Endpoint para agregar un nuevo miembro a un proyecto
   * Requiere autenticación
   * @param createProjectMemberDto - Datos del miembro a agregar (project_id, username/email del usuario y rol)
   * @returns El registro de miembro creado
   */
  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: false }
  }))
  create(@Body() createProjectMemberDto: CreateProjectMemberDto) {
    return this.projectMembersService.create(createProjectMemberDto);
  }

  /**
   * Endpoint para obtener todos los miembros de todos los proyectos
   * Requiere autenticación
   * @returns Lista de todos los miembros de proyectos
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.projectMembersService.findAll();
  }

  /**
   * Endpoint para obtener todos los miembros de un proyecto específico
   * Requiere autenticación
   * @param projectId - ID del proyecto
   * @returns Lista de miembros del proyecto
   */
  @UseGuards(AuthGuard)
  @Get('project/:projectId')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.projectMembersService.findByProject(projectId);
  }

  /**
   * Endpoint para obtener todos los proyectos de un usuario específico
   * Requiere autenticación
   * @param userId - ID del usuario
   * @returns Lista de proyectos del usuario
   */
  @UseGuards(AuthGuard)
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.projectMembersService.findByUser(userId);
  }

  /**
   * Endpoint para obtener un miembro específico por ID
   * Requiere autenticación
   * @param id - ID del registro de miembro
   * @returns Información del miembro del proyecto
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectMembersService.findOne(id);
  }

  /**
   * Endpoint para obtener un miembro específico por proyecto y usuario
   * Requiere autenticación
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario
   * @returns Información del miembro del proyecto
   */
  @UseGuards(AuthGuard)
  @Get('project/:projectId/user/:userId')
  findByProjectAndUser(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectMembersService.findByProjectAndUser(projectId, userId);
  }

  /**
   * Endpoint para actualizar la información de un miembro del proyecto
   * Requiere autenticación
   * @param id - ID del registro de miembro
   * @param updateProjectMemberDto - Datos a actualizar
   * @returns El registro actualizado
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: false } 
  }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectMemberDto: UpdateProjectMemberDto,
  ) {
    return this.projectMembersService.update(id, updateProjectMemberDto);
  }

  /**
   * Endpoint para eliminar un miembro de un proyecto
   * Requiere autenticación
   * @param id - ID del registro de miembro
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectMembersService.remove(id);
  }

  /**
   * Endpoint para eliminar un miembro de un proyecto usando project_id y user_id
   * Requiere autenticación
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete('project/:projectId/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByProjectAndUser(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.projectMembersService.removeByProjectAndUser(projectId, userId);
  }
}

