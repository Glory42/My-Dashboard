import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyCardOwnership(cardId: string, userId: string) {
    const card = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: { column: { include: { workspace: true } } },
    });
    if (!card) throw new NotFoundException('Card not found');
    if (card.column.workspace.userId !== userId) throw new ForbiddenException();
    return card;
  }

  private async verifyColumnOwnership(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { workspace: true },
    });
    if (!column) throw new NotFoundException('Column not found');
    if (column.workspace.userId !== userId) throw new ForbiddenException();
    return column;
  }

  async findAll(columnId: string, userId: string) {
    await this.verifyColumnOwnership(columnId, userId);
    return this.prisma.card.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
    });
  }

  async create(userId: string, dto: CreateCardDto) {
    await this.verifyColumnOwnership(dto.columnId, userId);

    const last = await this.prisma.card.findFirst({
      where: { columnId: dto.columnId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.card.create({
      data: {
        columnId: dto.columnId,
        title: dto.title,
        description: dto.description,
        tag: dto.tag,
        tagColor: dto.tagColor,
        position: (last?.position ?? -1) + 1,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateCardDto) {
    await this.verifyCardOwnership(id, userId);
    return this.prisma.card.update({ where: { id }, data: dto });
  }

  async move(id: string, userId: string, dto: MoveCardDto) {
    await this.verifyCardOwnership(id, userId);
    await this.verifyColumnOwnership(dto.columnId, userId);

    return this.prisma.$transaction([
      this.prisma.card.updateMany({
        where: {
          columnId: dto.columnId,
          position: { gte: dto.position },
          id: { not: id },
        },
        data: { position: { increment: 1 } },
      }),
      this.prisma.card.update({
        where: { id },
        data: { columnId: dto.columnId, position: dto.position },
      }),
    ]);
  }

  async remove(id: string, userId: string) {
    await this.verifyCardOwnership(id, userId);
    return this.prisma.card.delete({ where: { id } });
  }
}
