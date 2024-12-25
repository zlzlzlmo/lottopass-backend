import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoService } from './lotto.service';
import { LottoController } from './lotto.controller';
import { LottoDrawEntity } from './lotto-draw.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LottoDrawEntity])],
  providers: [LottoService],
  controllers: [LottoController],
})
export class LottoModule {}
