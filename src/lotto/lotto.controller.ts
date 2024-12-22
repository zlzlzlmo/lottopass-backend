// lotto.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LottoService } from './lotto.service';

@Controller('lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  @Get('draw')
  getLottoDraw(@Query('drwNo') drawNumber: string) {
    return this.lottoService.fetchLottoDraw(drawNumber);
  }

  @Post('latest-rounds-numbers')
  getLottoDraws(@Body('drwNos') drawNumbers: string[]) {
    return this.lottoService.fetchLottoDraws(drawNumbers);
  }

  @Get('latest-round')
  async getLatestRound() {
    const latestRound = await this.lottoService.getLatestRound();
    return latestRound
  }

  // 가장 최근 5개의 회차
  @Get('latest-rounds')
  async getLatestRounds() {
    const latestRound = await this.lottoService.getLatestRound();

    return Array.from({length : 5}, (_, i) => latestRound - i)
  }
}
