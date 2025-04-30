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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Optional,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Express } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CloudinaryService } from 'src/config/cloudinary.config';
import { User } from 'src/auth/user.decorator';

/**
 * Controlador para la gestión de usuarios
 * Proporciona endpoints para crear, leer, actualizar y eliminar usuarios
 */
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
  @Get('me')
  getCurrentUser(@User('sub') userId: number) {
    return this.usersService.findOne(userId);
  }

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
  /**
   * Endpoint para actualizar la información de un usuario, incluyendo su avatar
   * Acepta multipart/form-data para permitir la subida de archivos
   * Requiere autenticación
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar del usuario (como campos de formulario)
   * @param avatar - Archivo de imagen para el avatar (opcional)
   * @returns El usuario con la información actualizada
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', {
    // Configure multer to handle form data
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Optional() // Make the file optional
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false, // Avatar is optional
        exceptionFactory: (error) => {
          Logger.error(`File validation error: ${error}`, 'UserController');
          return new BadRequestException(`Error en la validación del archivo: ${error}`);
        },
      }),
    )
    avatar?: Express.Multer.File,
  ) {
    // Log received data for debugging
    Logger.debug(`Updating user ${id} with data: ${JSON.stringify(updateUserDto)}`, 'UserController');
    if (avatar) {
      Logger.debug(`Avatar file received: ${avatar.originalname}`, 'UserController');
    }

    // If an avatar file is uploaded, process it and get the URL
    if (avatar) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(avatar);
        updateUserDto.avatar = uploadResult.secure_url;
        Logger.debug(`Avatar uploaded successfully to: ${uploadResult.secure_url}`, 'UserController');
      } catch (error) {
        Logger.error(`Error uploading avatar: ${error.message}`, error.stack, 'UserController');
        throw new BadRequestException(`Error al subir el avatar: ${error.message}`);
      }
    }
    
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

