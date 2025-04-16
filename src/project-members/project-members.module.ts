import { Module } from '@nestjs/common';
import { ProjectMembersService } from './project-members.service';
import { ProjectMembersController } from './project-members.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

/**
 * Módulo de Miembros de Proyectos
 * Gestiona las funcionalidades relacionadas con los miembros de cada proyecto
 */
@Module({
  imports: [PrismaModule],
  controllers: [ProjectMembersController],
  providers: [ProjectMembersService],
  exports: [ProjectMembersService],
})
export class ProjectMembersModule {}

