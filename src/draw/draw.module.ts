import { Module } from '@nestjs/common';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoDrawEntity } from './lotto-draw.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LottoDrawEntity])],
  controllers: [DrawController],
  providers: [DrawService],
})
export class DrawModule {}
