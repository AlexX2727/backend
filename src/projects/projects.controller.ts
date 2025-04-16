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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Controlador para la gestión de proyectos
 * Proporciona endpoints para crear, leer, actualizar y eliminar proyectos
 */
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Endpoint para crear un nuevo proyecto
   * Requiere autenticación
   * @param createProjectDto - Datos del proyecto a crear
   * @returns El proyecto creado con su información
   */
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  /**
   * Endpoint para obtener todos los proyectos
   * Requiere autenticación
   * @returns Lista de todos los proyectos registrados
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  /**
   * Endpoint para obtener los proyectos de un propietario específico
   * Requiere autenticación
   * @param ownerId - ID del propietario
   * @returns Lista de proyectos del propietario
   */
  @UseGuards(AuthGuard)
  @Get('owner/:ownerId')
  findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
    return this.projectsService.findByOwner(ownerId);
  }

  /**
   * Endpoint para obtener un proyecto específico por su ID
   * Requiere autenticación
   * @param id - ID del proyecto a buscar
   * @returns Información del proyecto solicitado
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  /**
   * Endpoint para actualizar la información de un proyecto
   * Requiere autenticación
   * @param id - ID del proyecto a actualizar
   * @param updateProjectDto - Datos a actualizar del proyecto
   * @returns El proyecto con la información actualizada
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  /**
   * Endpoint para eliminar un proyecto
   * Requiere autenticación
   * @param id - ID del proyecto a eliminar
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}

