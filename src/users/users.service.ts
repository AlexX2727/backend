import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { encrypt } from 'src/libs/bcryptjs';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de usuarios
 * Contiene la lógica de negocio para crear, leer, actualizar y eliminar usuarios
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
}