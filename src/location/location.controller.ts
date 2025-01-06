import { Controller, Get, Query } from '@nestjs/common';
import { LocationService } from './location.service';
import { CoordinatesDto } from './dto/coordinates.dto';
import { FindAllResponse } from 'lottopass-shared';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // 내 위치 가져오기
  @Get('current')
  async getCurrentLocation(
    @Query() coordinates: CoordinatesDto
  ): Promise<FindAllResponse<string>> {
    const { latitude, longitude } = coordinates;
    const data = await this.locationService.fetchAddressFromCoordinates(
      latitude,
      longitude
    );
    return { status: 'success', data };
  }
}
