import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ColumnsModule } from './modules/columns/columns.module';
import { CardsModule } from './modules/cards/cards.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    ColumnsModule,
    CardsModule,
  ],
})
export class AppModule {}
