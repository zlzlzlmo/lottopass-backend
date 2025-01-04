import { Controller, Get } from '@nestjs/common';
import { FindAllResponse } from 'lottopass-shared';
import { DrawService } from './draw.service';
import { LottoDrawEntity } from './lotto-draw.entity';

@Controller('draw')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Get()
  getDraw() {
    return { message: 'Draw endpoint works!' };
  }

  // 가장 최근 회차 정보 가져오기
  @Get('latest')
  async getLatestDrawInfo(): Promise<FindAllResponse<LottoDrawEntity>> {
    console.log('sdafasd11');
    const data = await this.drawService.getLatestRound();
    return {
      status: 'success',
      data,
    };
  }
}
