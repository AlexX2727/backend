import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de proyectos
 * Contiene la lógica de negocio para crear, leer, actualizar y eliminar proyectos
 */
@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo proyecto en la base de datos
   * @param createProjectDto - Datos del proyecto a crear
   * @returns El proyecto creado con información del propietario
   */
  async create(createProjectDto: CreateProjectDto) {
    const { owner_id, startDate, endDate, ...rest } = createProjectDto;
    
    try {
      // Verificar que el usuario existe antes de crear el proyecto
      const userExists = await this.prisma.user.findUnique({
        where: { id: owner_id }
      });
      
      if (!userExists) {
        throw new BadRequestException(`Usuario con ID ${owner_id} no encontrado`);
      }
      
      // Convertir fechas a cadenas si están definidas
      const formattedStartDate = startDate ? new Date(startDate).toISOString().split('T')[0] : null;
      const formattedEndDate = endDate ? new Date(endDate).toISOString().split('T')[0] : null;

      // Crear el proyecto con los datos proporcionados
      return await this.prisma.project.create({
        data: {
          ...rest,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          owner: {
            connect: {
              id: owner_id,
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
              avatar: true,
            }
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un proyecto con ese nombre');
        }
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los proyectos registrados
   * @returns Lista de todos los proyectos con sus propietarios
   */
  async findAll() {
    return this.prisma.project.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            members: true,
            tasks: true
          }
        }
      },
    });
  }

  /**
   * Busca un proyecto por su ID
   * @param id - ID del proyecto a buscar
   * @returns Información del proyecto solicitado
   * @throws NotFoundException si el proyecto no existe
   */
  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                avatar: true,
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }

    return project;
  }

  /**
   * Busca proyectos por propietario
   * @param ownerId - ID del propietario
   * @returns Lista de proyectos del propietario
   */
  async findByOwner(ownerId: number) {
    return this.prisma.project.findMany({
      where: { owner_id: ownerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
          }
        },
        _count: {
          select: {
            members: true,
            tasks: true
          }
        }
      },
    });
  }

  /**
   * Actualiza la información de un proyecto existente
   * @param id - ID del proyecto a actualizar
   * @param updateProjectDto - Datos a actualizar del proyecto
   * @returns El proyecto con la información actualizada
   * @throws NotFoundException si el proyecto no existe
   */
  async update(id: number, updateProjectDto: UpdateProjectDto) {
    // Verificar que el proyecto existe
    await this.findOne(id);
    
    const { owner_id, ...rest } = updateProjectDto;
    
    try {
      // Preparar el objeto de datos para la actualización
      const data: any = { ...rest };
      
      // Si se proporciona un nuevo propietario, actualizarlo
      if (owner_id) {
        // Verificar que el nuevo propietario existe
        const userExists = await this.prisma.user.findUnique({
          where: { id: owner_id }
        });
        
        if (!userExists) {
          throw new BadRequestException(`Usuario con ID ${owner_id} no encontrado`);
        }
        
        data.owner = {
          connect: {
            id: owner_id,
          },
        };
      }
      
      // Actualizar el proyecto en la base de datos
      return await this.prisma.project.update({
        where: { id },
        data,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
              avatar: true,
            }
          },
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Ya existe un proyecto con ese nombre');
        }
      }
      throw error;
    }
  }

  /**
   * Elimina un proyecto de la base de datos
   * @param id - ID del proyecto a eliminar
   * @returns Información del proyecto eliminado
   * @throws NotFoundException si el proyecto no existe
   */
  async remove(id: number) {
    try {
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(`No se puede eliminar el proyecto porque tiene registros relacionados`);
    }
  }
}

