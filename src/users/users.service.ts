import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { encrypt } from 'src/libs/bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, role_id, ...rest } = createUserDto;
    
    // Hash the password
    const hashedPassword = await encrypt(password);
    
    return this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        role: {
          connect: {
            id: role_id,
          },
        },
      },
      include: {
        role: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        role: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, role_id, ...rest } = updateUserDto;
    
    // Prepare the data object
    const data: any = { ...rest };
    
    // If password is updated, hash it
    if (password) {
      data.password = await encrypt(password);
    }
    
    // If role_id is provided, connect to that role
    if (role_id) {
      data.role = {
        connect: {
          id: role_id,
        },
      };
    }
    
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if user exists
    
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

