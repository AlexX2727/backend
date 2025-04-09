import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  create(createRoleDto: CreateRoleDto) {
    return this.prisma.role.create({
      data: createRoleDto,
    });
  }

  findAll() {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  remove(id: number) {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}

