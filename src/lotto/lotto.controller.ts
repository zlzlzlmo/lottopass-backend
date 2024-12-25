import { Controller, Get, Param } from '@nestjs/common';
import { LottoService } from './lotto.service';

@Controller('lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  @Get('draw/:drawNumber')
  async getLottoDraw(@Param('drawNumber') drawNumber: number) {
    return this.lottoService.fetchLottoDraw(drawNumber);
  }

  @Get('all')
  async getAllLottoDraws() {
    const latestRound = await this.lottoService.getLatestRound();
    const drawNumbers = Array.from({ length: latestRound }, (_, i) => i + 1);
    return this.lottoService.fetchLottoDraws(drawNumbers);
  }
}
