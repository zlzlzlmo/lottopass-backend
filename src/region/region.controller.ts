import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { LottoCrawlerService } from './crawler.service';
import { FindAllResponse } from 'lottopass-shared';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';
import { RegionService } from './region.service';

@Controller('region')
export class RegionController {
  constructor(
    private readonly crawlerService: LottoCrawlerService,
    private readonly regionService: RegionService
  ) {}

  @Get('crawl/:drawNumber')
  async oneCrawl(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<WinningRegionEntity>> {
    const data = await this.crawlerService.crawlFirstPrize(drawNumber);
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

  @Get('winning')
  async getWinningRegionsByLocation(
    @Query('province') province: string,
    @Query('city') city: string
  ): Promise<WinningRegionEntity[]> {
    if (!province || !city) {
      throw new Error('Province and City parameters are required.');
    }
    return this.regionService.findByLocation(province, city);
  }
}
