import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    if (workspace.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this workspace',
      );
    }

    return workspace;
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const last = await this.prisma.workspace.findFirst({
      where: { userId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    return this.prisma.workspace.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        color: dto.color,
        position: (last?.position ?? -1) + 1,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    if (workspace.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this workspace',
      );
    }
    return this.prisma.workspace.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    if (workspace.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to access this workspace',
      );
    }
    return this.prisma.workspace.delete({
      where: { id },
    });
  }
}
