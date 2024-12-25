// lotto.module.ts
import { Module } from '@nestjs/common';
import { LottoController } from './lotto.controller';
import { LottoService } from './lotto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoDrawEntity } from './lotto-draw.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LottoDrawEntity])],
  providers: [LottoService],
  controllers: [LottoController],
})
export class LottoModule {}