import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionController } from './region.controller';
import { WinningRegionEntity } from './winning-region.entity';
import { HttpModule } from '@nestjs/axios';
import { UniqueRegionEntity } from './unique-region.entity';
import { RegionService } from './region.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { DetailDrawEntity } from 'src/crawler/detail-draw.entity';
import { LottoDrawEntity } from 'src/draw/lotto-draw.entity';
import { DrawModule } from 'src/draw/draw.module';
import { DrawService } from 'src/draw/draw.service';
import { StoreRegionEntity } from './store-region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UniqueRegionEntity,
      WinningRegionEntity,
      LottoDrawEntity,
      DetailDrawEntity,
      StoreRegionEntity,
    ]),
    HttpModule,
    DrawModule,
    CrawlerModule,
  ],
  controllers: [RegionController],
  providers: [DrawService, RegionService, CrawlerService],
})
export class RegionModule {}
