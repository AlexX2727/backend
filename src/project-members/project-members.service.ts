import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateProjectMemberDto, ProjectRole } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Servicio para la gestión de miembros de proyectos
 * Contiene la lógica de negocio para agregar, obtener, actualizar y eliminar miembros de proyectos
 */
@Injectable()
export class ProjectMembersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Agrega un nuevo miembro a un proyecto
   * @param createProjectMemberDto - Datos del miembro a agregar
   * @returns El registro de miembro creado con información del usuario y proyecto
   */
  async create(createProjectMemberDto: CreateProjectMemberDto) {
    const { project_id, user_identifier, role } = createProjectMemberDto;
    
    // Validación adicional para garantizar que role sea un valor válido
    if (!Object.values(ProjectRole).includes(role)) {
      throw new BadRequestException(`Rol inválido: ${role}. Los valores permitidos son: ${Object.values(ProjectRole).join(', ')}`);
    }
    
    try {
      // Verificar que el proyecto existe
      const projectExists = await this.prisma.project.findUnique({
        where: { id: project_id }
      });
      
      if (!projectExists) {
        throw new BadRequestException(`Proyecto con ID ${project_id} no encontrado`);
      }
      
      // Verificar que el usuario existe por nombre de usuario o correo
      const userExists = await this.findUserByIdentifier(user_identifier);
      
      if (!userExists) {
        throw new BadRequestException(`Usuario con nombre de usuario o correo "${user_identifier}" no encontrado`);
      }
      
      // Verificar si el usuario ya es miembro del proyecto
      const existingMember = await this.prisma.projectMember.findFirst({
        where: {
          project_id,
          user_id: userExists.id
        }
      });
      
      if (existingMember) {
        throw new ConflictException(`El usuario ya es miembro de este proyecto`);
      }
      
      // Agregar el miembro al proyecto con rol 'Member' por defecto
      return await this.prisma.projectMember.create({
        data: {
          project: {
            connect: {
              id: project_id,
            },
          },
          user: {
            connect: {
              id: userExists.id,
            },
          },
          role, // Usar el rol proporcionado
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
            }
          },
          user: {
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
          throw new ConflictException('El usuario ya es miembro de este proyecto');
        }
      }
      throw error;
    }
  }

  /**
   * Utilidad para encontrar un usuario por nombre de usuario o correo electrónico
   * @param identifier - Nombre de usuario o correo electrónico
   * @returns El usuario encontrado o null si no existe
   */
  async findUserByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ]
      }
    });
  }

  /**
   * Obtiene todos los miembros de todos los proyectos
   * @returns Lista de todos los miembros de proyectos
   */
  async findAll() {
    return this.prisma.projectMember.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          }
        },
        user: {
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
  }

  /**
   * Obtiene todos los miembros de un proyecto específico
   * @param projectId - ID del proyecto
   * @returns Lista de miembros del proyecto
   */
  async findByProject(projectId: number) {
    // Verificar que el proyecto existe
    const projectExists = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!projectExists) {
      throw new NotFoundException(`Proyecto con ID ${projectId} no encontrado`);
    }
    
    return this.prisma.projectMember.findMany({
      where: { project_id: projectId },
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
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }

  /**
   * Obtiene todos los proyectos de un usuario específico
   * @param userId - ID del usuario
   * @returns Lista de proyectos del usuario
   */
  async findByUser(userId: number) {
    // Verificar que el usuario existe
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userExists) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    return this.prisma.projectMember.findMany({
      where: { user_id: userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
              }
            },
            _count: {
              select: {
                members: true,
                tasks: true,
              }
            }
          }
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  /**
   * Busca un miembro específico de un proyecto
   * @param id - ID del registro de miembro
   * @returns Información del miembro del proyecto
   */
  async findOne(id: number) {
    const projectMember = await this.prisma.projectMember.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          }
        },
        user: {
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

    if (!projectMember) {
      throw new NotFoundException(`Miembro de proyecto con ID ${id} no encontrado`);
    }

    return projectMember;
  }

  /**
   * Encuentra un miembro específico por proyecto y usuario
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario
   * @returns Información del miembro del proyecto
   */
  async findByProjectAndUser(projectId: number, userId: number) {
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
          }
        },
        user: {
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

    if (!projectMember) {
      throw new NotFoundException(`El usuario ${userId} no es miembro del proyecto ${projectId}`);
    }

    return projectMember;
  }

  /**
   * Actualiza la información de un miembro del proyecto
   * @param id - ID del registro de miembro
   * @param updateProjectMemberDto - Datos a actualizar
   * @returns El registro actualizado
   */
  async update(id: number, updateProjectMemberDto: UpdateProjectMemberDto) {
    // Verificar que el miembro existe
    await this.findOne(id);
    
    try {
      // Validación adicional para garantizar que role sea un valor válido
      if (updateProjectMemberDto.role && !Object.values(ProjectRole).includes(updateProjectMemberDto.role)) {
        throw new BadRequestException(`Rol inválido: ${updateProjectMemberDto.role}. Los valores permitidos son: ${Object.values(ProjectRole).join(', ')}`);
      }
      
      // El DTO ya está diseñado para solo aceptar el campo role
      const data = updateProjectMemberDto;
      
      // Actualizar el miembro en la base de datos
      return await this.prisma.projectMember.update({
        where: { id },
        data,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
            }
          },
          user: {
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
      throw error;
    }
  }

  /**
   * Elimina un miembro de un proyecto
   * @param id - ID del registro de miembro
   * @returns El registro eliminado
   */
  async remove(id: number) {
    // Verificar que el miembro existe antes de eliminarlo
    await this.findOne(id);
    
    try {
      // Eliminar el miembro del proyecto
      return await this.prisma.projectMember.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina un miembro de un proyecto usando project_id y user_id
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario
   * @returns El registro eliminado
   */
  async removeByProjectAndUser(projectId: number, userId: number) {
    // Verificar que la combinación existe
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        project_id: projectId,
        user_id: userId,
      },
    });

    if (!projectMember) {
      throw new NotFoundException(`El usuario ${userId} no es miembro del proyecto ${projectId}`);
    }
    
    try {
      // Eliminar el miembro del proyecto
      return await this.prisma.projectMember.delete({
        where: { id: projectMember.id },
      });
    } catch (error) {
      throw error;
    }
  }
}

