import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from './email.service';
import { encrypt } from 'src/libs/bcryptjs';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de usuarios
 * Contiene la lógica de negocio para crear, leer, actualizar y eliminar usuarios
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService, 
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos
   * @param createUserDto - Datos del usuario a crear
   * @returns El usuario creado con su información de rol
   */
  async create(createUserDto: CreateUserDto) {
    const { password, role_id = 2, ...rest } = createUserDto; // Asignar 2 como valor predeterminado para role_id
    
    try {
      // Encriptar la contraseña antes de guardarla en la base de datos
      const hashedPassword = await encrypt(password);
      
      // Crear el usuario con los datos proporcionados
      return await this.prisma.user.create({
        data: {
          ...rest,
          password: hashedPassword,
          role: {
            connect: {
              id: role_id, // Usar el role_id proporcionado o el valor predeterminado (2)
            },
          },
        },
        include: {
          role: true,
        },
      });
    } catch (error) {
      // Manejar errores de unicidad (email o username duplicados)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El email o username ya está registrado');
        }
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios registrados
   * @returns Lista de todos los usuarios con sus roles
   */
  async findAll() {
    return this.prisma.user.findMany({
      include: {
        role: true,
      },
    });
  }

  /**
   * Busca un usuario por su ID
   * @param id - ID del usuario a buscar
   * @returns Información del usuario solicitado
   * @throws NotFoundException si el usuario no existe
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Busca un usuario por su email
   * @param email - Email del usuario a buscar
   * @returns Información del usuario o null si no existe
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  /**
   * Busca un usuario por su nombre de usuario
   * @param username - Nombre de usuario a buscar
   * @returns Información del usuario o null si no existe
   */
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
      },
    });
  }

  /**
   * Actualiza la información de un usuario existente
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar del usuario
   * @returns El usuario con la información actualizada
   * @throws NotFoundException si el usuario no existe
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    // Verificar que el usuario existe
    await this.findOne(id);
    
    // Log para depuración
    Logger.debug(`UsersService.update - Recibido DTO: ${JSON.stringify(updateUserDto)}`, 'UsersService');
    
    const { password, role_id, ...restData } = updateUserDto;
    
    // Preparar el objeto de datos para la actualización
    const data: any = {};
    
    // Solo incluir campos con valores válidos (no undefined ni cadenas vacías)
    Object.entries(restData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        data[key] = value;
      }
    });
    
    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      data.password = await encrypt(password);
    }
    
    // Si se proporciona un nuevo rol, actualizarlo
    if (role_id) {
      data.role = {
        connect: {
          id: role_id,
        },
      };
    }
    
    // Verificar si hay datos para actualizar
    if (Object.keys(data).length === 0 && !role_id) {
      Logger.warn('No hay datos válidos para actualizar', 'UsersService');
      // Si no hay nada que actualizar, simplemente retornar el usuario actual
      return this.findOne(id);
    }
    
    try {
      // Log final de datos a actualizar
      Logger.debug(`Datos finales para actualizar: ${JSON.stringify(data)}`, 'UsersService');
      
      // Ejecutar la actualización en la base de datos
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        include: {
          role: true,
        },
      });
      
      // Log para depuración - resultado de la actualización
      Logger.debug(`UsersService.update - Usuario actualizado: ${JSON.stringify(updatedUser)}`, 'UsersService');
      
      return updatedUser;
    } catch (error) {
      Logger.error(`Error al actualizar usuario: ${error.message}`, error.stack, 'UsersService');
      
      // Manejar errores específicos de Prisma
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('El email o username ya está en uso por otro usuario');
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('El rol especificado no existe');
        }
      }
      throw error;
    }
  }

  /**
   * Elimina un usuario de la base de datos
   * @param id - ID del usuario a eliminar
   * @returns Información del usuario eliminado
   * @throws NotFoundException si el usuario no existe
   */
  async remove(id: number) {
    // Verificar que el usuario existe antes de eliminarlo
    await this.findOne(id);
    
    try {
      // Eliminar el usuario de la base de datos
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      // Manejar posibles errores de restricciones de integridad
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('No se puede eliminar el usuario porque tiene registros relacionados');
        }
      }
      throw error;
    }
  }

  /**
   * Inicia el proceso de recuperación de contraseña generando un token
   * y enviando un correo electrónico con instrucciones
   * 
   * @param forgotPasswordDto DTO con el correo electrónico del usuario
   * @returns Mensaje de confirmación
   * @throws NotFoundException si el usuario no existe
   * @throws InternalServerErrorException si hay un error al enviar el correo
   */
  /**
   * Genera un código alfanumérico aleatorio para verificación
   * @param length Longitud del código (default: 6)
   * @returns Código alfanumérico aleatorio
   */
  private generateVerificationCode(length: number = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluimos caracteres similares como 0/O, 1/I
    let code = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    
    return code;
  }
  
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    
    try {
      // Normalizar el email antes de la búsqueda
      const normalizedEmail = email.toLowerCase().trim();
      
      this.logger.log(`Buscando usuario con email: ${normalizedEmail}`);
      
      // Buscar al usuario por su email
      const user = await this.findByEmail(normalizedEmail);
      
      // Si el usuario no existe, no lanzar error pero registrar en el log
      if (!user) {
        this.logger.warn(`No se encontró un usuario con el email: ${normalizedEmail}`);
        
        // Por seguridad, siempre devolver el mismo mensaje
        return { 
          message: 'Si existe una cuenta con este correo electrónico, recibirás un código de verificación para restablecer tu contraseña' 
        };
      }
      
      // Generar código de verificación aleatorio
      const verificationCode = this.generateVerificationCode();
      
      // Calcular la fecha de expiración (15 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);
      
      // Eliminar códigos anteriores no utilizados para este usuario
      await this.prisma.verificationCode.deleteMany({
        where: {
          userId: user.id,
          isUsed: false,
        },
      });
      
      // Almacenar el código en la base de datos
      await this.prisma.verificationCode.create({
        data: {
          code: verificationCode,
          userId: user.id,
          expiresAt,
        },
      });
      
      // Enviar correo con el código de verificación
      await this.emailService.sendVerificationCode(
        user.email,
        user.username || user.firstName || '',
        verificationCode
      );
      
      this.logger.log(`Código de verificación generado para usuario: ${user.email}`);
      
      // Retornar mensaje de éxito (sin exponer si el email existe o no, por seguridad)
      return { 
        message: 'Si existe una cuenta con este correo electrónico, recibirás un código de verificación para restablecer tu contraseña' 
      };
    } catch (error) {
      this.logger.error(`Error en recuperación de contraseña: ${error.message}`, error.stack);
      
      // No reenviar el error específico al cliente, por seguridad
      return { 
        message: 'Si existe una cuenta con este correo electrónico, recibirás un código de verificación para restablecer tu contraseña' 
      };
    }
  }
  
  /**
   * Restablece la contraseña de un usuario utilizando un token válido
   * 
   * @param resetPasswordDto DTO con el token y la nueva contraseña
   * @returns Mensaje de confirmación
   * @throws UnauthorizedException si el token es inválido o ha expirado
   * @throws NotFoundException si el usuario no existe
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { code, email, password, confirmPassword } = resetPasswordDto;
    
    try {
      // Verificar que las contraseñas coincidan
      if (password !== confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden');
      }
      
      // Normalizar el email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Buscar al usuario por su email
      const user = await this.findByEmail(normalizedEmail);
      
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      
      // Buscar el código de verificación
      const verificationCode = await this.prisma.verificationCode.findFirst({
        where: {
          code: code,
          userId: user.id,
          isUsed: false,
        },
      });
      
      // Verificar que exista el código
      if (!verificationCode) {
        throw new UnauthorizedException('Código de verificación inválido');
      }
      
      // Verificar que el código no haya expirado
      const now = new Date();
      if (verificationCode.expiresAt < now) {
        throw new UnauthorizedException('El código de verificación ha expirado');
      }
      
      // Encriptar la nueva contraseña
      const hashedPassword = await encrypt(password);
      
      // Actualizar la contraseña del usuario
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      // Marcar el código como utilizado
      await this.prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { isUsed: true },
      });
      
      this.logger.log(`Contraseña restablecida exitosamente para usuario: ${user.email}`);
      
      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      this.logger.error(`Error al restablecer contraseña: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error al restablecer la contraseña');
    }
  }
}
