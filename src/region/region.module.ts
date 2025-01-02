import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionController } from './region.controller';
import { WinningRegionEntity } from './winning-region.entity';
import { HttpModule } from '@nestjs/axios';
import { LottoCrawlerService } from './crawler.service';
import { LottoModule } from 'src/lotto/lotto.module';
import { LottoService } from 'src/lotto/lotto.service';
import { LottoDrawEntity } from 'src/lotto/lotto-draw.entity';
import { UniqueRegionEntity } from './unique-region.entitiy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UniqueRegionEntity]),
    TypeOrmModule.forFeature([WinningRegionEntity]),
    TypeOrmModule.forFeature([LottoDrawEntity]),
    HttpModule,
    LottoModule,
  ],
  controllers: [RegionController],
  providers: [LottoCrawlerService, LottoService],
})
export class RegionModule {}
