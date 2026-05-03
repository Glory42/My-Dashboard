import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.userId !== userId) throw new ForbiddenException();

    return this.prisma.column.findMany({
      where: { workspaceId },
      orderBy: { position: 'asc' },
    });
  }

  async create(userId: string, dto: CreateColumnDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: dto.workspaceId },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.userId !== userId) throw new ForbiddenException();

    const last = await this.prisma.column.findFirst({
      where: { workspaceId: dto.workspaceId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.column.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        color: dto.color,
        position: (last?.position ?? -1) + 1,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { workspace: true },
    });
    if (!column) throw new NotFoundException('Column not found');
    if (column.workspace.userId !== userId) throw new ForbiddenException();

    return this.prisma.column.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { workspace: true },
    });
    if (!column) throw new NotFoundException('Column not found');
    if (column.workspace.userId !== userId) throw new ForbiddenException();

    return this.prisma.column.delete({ where: { id } });
  }
}
