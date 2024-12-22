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

  private async isValidRound(drwNo: number): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.lottoApiUrl}&drwNo=${drwNo}`,
      );
      if(response.data.returnValue === 'fail') return false
      return response.status === 200
    } catch {
      return false;
    }
  }

  async getLatestRound(): Promise<number> {
    let round = 1000; // 시작 회차 (적당히 과거 회차로 설정)
    while (true) {
      const isValid = await this.isValidRound(round + 1);
      if (!isValid) break;
      round++;
    }
    
    return round
  }
}
