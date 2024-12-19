// lotto.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LottoService } from './lotto.service';

@Controller('lotto')
export class LottoController {
  constructor(private readonly lottoService: LottoService) {}

  @Get('draw')
  getLottoDraw(@Query('drwNo') drawNumber: string) {
    return this.lottoService.fetchLottoDraw(drawNumber);
  }
}
