import { Module } from '@nestjs/common';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoDrawEntity } from './lotto-draw.entity';
import { RegionService } from 'src/region/region.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { WinningRegionEntity } from 'src/region/winning-region.entity';
import { UniqueRegionEntity } from 'src/region/unique-region.entity';
import { DetailDrawEntity } from 'src/crawler/detail-draw.entity';
import { StoreRegionEntity } from 'src/region/store-region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LottoDrawEntity,
      WinningRegionEntity,
      UniqueRegionEntity,
      DetailDrawEntity,
      StoreRegionEntity,
    ]),
  ],
  controllers: [DrawController],
  providers: [DrawService, RegionService, CrawlerService],
})
export class DrawModule {}
