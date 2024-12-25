import { Controller, Get, Param } from '@nestjs/common';
import { LottoService } from './lotto.service';
import { FindAllResponse } from 'lottopass-shared';

@Controller('lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  @Get('draw/:drawNumber')
  async getLottoDraw(@Param('drawNumber') drawNumber: number): Promise<FindAllResponse> {
    const data = await this.lottoService.fetchLottoDraw(drawNumber);
    return {
      status: 'success',
      data: [data],
    };
  }

  @Get('all')
  async getAllLottoDraws(): Promise<FindAllResponse> {
    const latestRound = await this.lottoService.getLatestRound();
    const drawNumbers = Array.from({ length: latestRound }, (_, i) => i + 1);
    const data = await this.lottoService.fetchLottoDraws(drawNumbers);
    return {
      status: 'success',
      data,
    };
  }
}
