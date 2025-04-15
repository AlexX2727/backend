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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

/**
 * Controlador para la gestión de usuarios
 * Proporciona endpoints para crear, leer, actualizar y eliminar usuarios
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint para crear un nuevo usuario
   * @param createUserDto - Datos del usuario a crear
   * @returns El usuario creado con su información
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Endpoint para obtener todos los usuarios
   * Requiere autenticación
   * @returns Lista de todos los usuarios registrados
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Endpoint para obtener un usuario específico por su ID
   * Requiere autenticación
   * @param id - ID del usuario a buscar
   * @returns Información del usuario solicitado
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * Endpoint para actualizar la información de un usuario
   * Requiere autenticación
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar del usuario
   * @returns El usuario con la información actualizada
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Endpoint para eliminar un usuario
   * Requiere autenticación
   * @param id - ID del usuario a eliminar
   * @returns Confirmación de la eliminación
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

