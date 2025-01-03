import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoDrawEntity } from 'src/lotto/lotto-draw.entity';
import { UniqueRegionEntity } from 'src/region/unique-region.entity';
import { WinningRegionEntity } from 'src/region/winning-region.entity';
import { DetailDrawEntity } from './detail-draw.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UniqueRegionEntity,
      WinningRegionEntity,
      LottoDrawEntity,
      DetailDrawEntity,
    ]),
  ],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}