import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LottoService } from './lotto.service';
import { FindAllResponse, LottoDraw } from 'lottopass-shared';

@Controller('lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  @Get()
  getAllLotto() {
    return { message: 'Lotto endpoint works!' };
  }

  @Get('draw/:drawNumber')
  async getLottoDraw(@Param('drawNumber', ParseIntPipe) drawNumber: number): Promise<FindAllResponse<LottoDraw[]>> {
    const data = await this.lottoService.fetchLottoDraw(drawNumber);
    return {
      status: 'success',
      data: [data],
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
