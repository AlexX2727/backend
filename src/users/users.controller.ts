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
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { CloudinaryService } from 'src/config/cloudinary.config';
import { User } from 'src/auth/user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Crear usuario
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Obtener usuario actual autenticado
   */
  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@User('sub') userId: number) {
    return this.usersService.findOne(userId);
  }

  /**
   * Listar todos los usuarios
   */
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtener usuario por ID
   */
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * Actualizar usuario por ID (incluye avatar y multipart/form-data)
   */
  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', {
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ 
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true
    })) updateUserDto: UpdateUserDto,
    @Optional()
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
        exceptionFactory: (error) => {
          Logger.warn(`Error de validación de avatar: ${error}`, 'UsersController');
          return null;
        },
      }),
    )
    avatar?: Express.Multer.File,
  ) {
    Logger.debug(`PATCH /users/${id} - Iniciando actualización`, 'UsersController');
    Logger.debug(`PATCH /users/${id} - Datos recibidos: ${JSON.stringify(updateUserDto)}`, 'UsersController');

    // Subir avatar si fue enviado
    if (avatar) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(avatar);
        updateUserDto.avatar = uploadResult.secure_url;
        Logger.debug(`Avatar subido a: ${uploadResult.secure_url}`, 'UsersController');
      } catch (error) {
        Logger.error(`Error al subir avatar: ${error.message}`, error.stack, 'UsersController');
        throw new BadRequestException(`Error al subir el avatar: ${error.message}`);
      }
    }

    const result = await this.usersService.update(id, updateUserDto);
    return {
      ...result,
      success: true,
      message: 'Perfil actualizado correctamente',
    };
  }

  /**
   * Eliminar usuario por ID
   */
  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  /**
   * Endpoint para solicitar recuperación de contraseña
   * Recibe un email y envía un correo con instrucciones si el usuario existe
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.usersService.forgotPassword(forgotPasswordDto);
  }

  /**
   * Endpoint para restablecer la contraseña con un token válido
   * Recibe un token y la nueva contraseña, y actualiza la contraseña si el token es válido
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetPasswordDto);
  }
}
