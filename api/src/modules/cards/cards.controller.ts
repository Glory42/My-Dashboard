import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  findAll(
    @Query('columnId') columnId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.cardsService.findAll(columnId, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCardDto, @CurrentUser() user: { id: string }) {
    return this.cardsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.cardsService.update(id, user.id, dto);
  }

  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body() dto: MoveCardDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.cardsService.move(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.cardsService.remove(id, user.id);
  }
}
