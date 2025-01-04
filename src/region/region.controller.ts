import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { LottoCrawlerService } from './crawler.service';
import { FindAllResponse, UniqueRegion, WinningRegion } from 'lottopass-shared';
import { WinningRegionEntity } from './winning-region.entity';
import { UniqueRegionEntity } from './unique-region.entity';
import { RegionService } from './region.service';
import { CrawlerService } from 'src/crawler/crawler.service';

@Controller('region')
export class RegionController {
  constructor(
    private readonly crawlerService: LottoCrawlerService,
    private readonly cService: CrawlerService,
    private readonly regionService: RegionService
  ) {}

  @Get('crawl/:drawNumber')
  async oneCrawl(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<WinningRegion>> {
    const data = await this.crawlerService.crawlFirstPrize(drawNumber);
    return { status: 'success', data };
  }

  @Get('unique/all')
  async getAllRegions(): Promise<FindAllResponse<UniqueRegion[]>> {
    const data = await this.regionService.getAllRegions();

    return {
      status: 'success',
      data,
    };
  }

  @Get('winning')
  async getWinningRegionsByLocation(
    @Query('province') province: string,
    @Query('city') city?: string
  ): Promise<WinningRegion[]> {
    if (!province) {
      throw new Error('Province parameter is required.');
    }
    return this.regionService.findByLocation(province, city);
  }

  @Get('winning/:drawNumber')
  async getWinningRegionsByDrawNumber(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ) {
    const res = await this.regionService.findByDrawNumber(drawNumber);
    return res;
  }

  @Get('stores/:province')
  async getAllStores(@Param('province') province: string): Promise<any[]> {
    console.log('aad1');

    console.log('DASfdasfasd');

    return this.regionService.fetchAllPages(province);
  }
}
