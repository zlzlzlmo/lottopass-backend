import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionController } from './region.controller';
import { WinningRegionEntity } from './winning-region.entity';
import { HttpModule } from '@nestjs/axios';
import { LottoCrawlerService } from './crawler.service';
import { LottoModule } from 'src/lotto/lotto.module';
import { LottoService } from 'src/lotto/lotto.service';
import { LottoDrawEntity } from 'src/lotto/lotto-draw.entity';
import { UniqueRegionEntity } from './unique-region.entity';
import { RegionService } from './region.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { DetailDrawEntity } from 'src/crawler/detail-draw.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UniqueRegionEntity,
      WinningRegionEntity,
      LottoDrawEntity,
      DetailDrawEntity,
    ]),
    HttpModule,
    LottoModule,
    CrawlerModule,
  ],
  controllers: [RegionController],
  providers: [LottoCrawlerService, LottoService, RegionService, CrawlerService],
})
export class RegionModule {}
