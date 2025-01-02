import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LottoCrawlerService } from './crawler.service';
import { FindAllResponse } from 'lottopass-shared';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entitiy';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: LottoCrawlerService) {}

  @Get('crawl/:drawNumber')
  async oneCrawl(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<WinningRegionEntity>> {
    const data = await this.regionService.crawlFirstPrize(drawNumber);
    return { status: 'success', data };
  }

  @Get('unique/all')
  async getAllRegions(): Promise<FindAllResponse<UniqueRegionEntity[]>> {
    const data = await this.regionService.getAllRegions();

    return {
      status: 'success',
      data,
    };
  }
}
