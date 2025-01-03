import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LottoService } from './lotto.service';
import { FindAllResponse, LottoDraw } from 'lottopass-shared';
import { CrawlerService } from 'src/crawler/crawler.service';
import { DetailDrawEntity } from 'src/crawler/detail-draw.entity';

@Controller('lotto')
export class LottoController {
  constructor(
    private readonly lottoService: LottoService,
    private readonly crawlerService: CrawlerService
  ) {}

  @Get()
  getAllLotto() {
    return { message: 'Lotto endpoint works!' };
  }

  @Get('draw/:drawNumber')
  async getLottoDraw(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<DetailDrawEntity[]>> {
    const data = await this.crawlerService.fetchDrawData(drawNumber);

    return {
      status: 'success',
      data,
    };
  }

  @Get('all')
  async getAllLottoDraws(): Promise<FindAllResponse<LottoDraw[]>> {
    const data = await this.lottoService.fetchAllLottoDraws();
    return { status: 'success', data };
  }

  @Get('latest')
  async getLatestRound(): Promise<FindAllResponse<LottoDraw>> {
    const drawNumber = await this.lottoService.getLatestRound();
    const data = await this.lottoService.fetchLottoDraw(drawNumber);
    return {
      status: 'success',
      data,
    };
  }
}
