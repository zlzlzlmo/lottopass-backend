import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  private kakaoApiUrl =
    'https://dapi.kakao.com/v2/local/geo/coord2address.json';
  private kakaoApiKey = process.env.KAKAO_API_KEY;

  async fetchAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string> {
    try {
      const response = await axios.get(this.kakaoApiUrl, {
        headers: {
          Authorization: `KakaoAK ${this.kakaoApiKey}`,
        },
        params: {
          x: longitude, // 경도
          y: latitude, // 위도
        },
      });

      if (response.data.documents.length === 0) {
        throw new HttpException(
          '주소 정보를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND
        );
      }

      // 첫 번째 결과의 주소 반환
      const address = response.data.documents[0].address.address_name;
      return address;
    } catch (error: any) {
      this.logger.error('KaKa API Error : ', error.response?.data?.message);
      // AxiosError로 에러 타입 좁히기
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.message || '카카오 API 호출 중 오류 발생',
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        '알 수 없는 오류가 발생했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
