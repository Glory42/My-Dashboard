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
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('columns')
@UseGuards(AuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Get()
  findAll(
    @Query('workspaceId') workspaceId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.columnsService.findAll(workspaceId, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateColumnDto, @CurrentUser() user: { id: string }) {
    return this.columnsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.columnsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.columnsService.remove(id, user.id);
  }
}
