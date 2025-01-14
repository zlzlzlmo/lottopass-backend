import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { FindAllResponse } from 'lottopass-shared';
import { DrawService } from './draw.service';
import { LottoDrawEntity } from './lotto-draw.entity';
import { RegionService } from 'src/region/region.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { DetailDrawEntity } from 'src/crawler/detail-draw.entity';

@Controller('draw')
export class DrawController {
  constructor(
    private readonly drawService: DrawService,
    private readonly regionService: RegionService,
    private readonly crawlerService: CrawlerService
  ) {}

  @Get()
  getDraw() {
    return { message: 'Draw endpoint works!' };
  }

  // 가장 최근 회차 정보 가져오기
  @Get('latest')
  async getLatestDrawInfo(): Promise<FindAllResponse<LottoDrawEntity>> {
    const data = await this.drawService.fetchLatestDraw();

    try {
      // 최신 회차의 당첨 매장이 이미 존재하는지 확인
      const isExist = await this.regionService.findWinningStoresByDrawNumber(
        data.drawNumber
      );

      // 당첨 매장이 없으면 크롤링 실행
      if (!isExist) {
        const winningStores = await this.crawlerService.crawlFirstPrize(
          data.drawNumber
        );

        if (!winningStores) {
          console.error('Failed to crawl winning stores');
          throw new Error('Failed to retrieve winning stores');
        }
      }
    } catch (error) {
    } finally {
      if (data)
        return {
          status: 'success',
          data,
        };
    }
  }

  @Get('all')
  async getAllDraws(): Promise<FindAllResponse<LottoDrawEntity[]>> {
    const data = await this.drawService.fetchAllDraws();
    return {
      status: 'success',
      data,
    };
  }

  @Get('/:drawNumber')
  async getOneDraw(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<LottoDrawEntity>> {
    const data = await this.drawService.fetchOneDraw(drawNumber);
    return {
      status: 'success',
      data,
    };
  }

  @Get('/detail/:drawNumber')
  async getDetailOneDraw(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<DetailDrawEntity[]>> {
    const data = await this.crawlerService.fetchDrawData(drawNumber);
    return {
      status: 'success',
      data,
    };
  }
}
