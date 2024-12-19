// lotto.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LottoService {
  private readonly lottoApiUrl =
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber';

  async fetchLottoDraw(drawNumber: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.lottoApiUrl}&drwNo=${drawNumber}`,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch lotto data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
