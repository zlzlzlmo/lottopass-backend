import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LottoService } from './lotto.service';
import { LottoController } from './lotto.controller';
import { LottoDrawEntity } from './lotto-draw.entity';
import { CrawlerService } from 'src/crawler/crawler.service';
import { WinningRegionEntity } from 'src/region/winning-region.entity';
import { UniqueRegionEntity } from 'src/region/unique-region.entity';
import { DetailDrawEntity } from 'src/crawler/detail-draw.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LottoDrawEntity,
      WinningRegionEntity,
      UniqueRegionEntity,
      DetailDrawEntity,
    ]),
  ],
  providers: [LottoService, CrawlerService],
  controllers: [LottoController],
})
export class LottoModule {}
