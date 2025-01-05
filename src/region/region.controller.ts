import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FindAllResponse, StoreInfo } from 'lottopass-shared';
import { RegionService } from './region.service';
import { UniqueRegionEntity } from './unique-region.entity';
import { WinningAllStoresDto } from './dto/winning-stores.dto';
import { WinningRegionEntity } from './winning-region.entity';
import { AllStoresByAdressDto } from './dto';

@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  // 모든 지역 가져오기
  @Get('unique/all')
  async getAllRegions(): Promise<FindAllResponse<UniqueRegionEntity[]>> {
    const data = await this.regionService.getAllRegions();

    return {
      status: 'success',
      data,
    };
  }

  // 1등 배출점 다 가져오기
  @Get('stores/winning')
  async getWinningRegionsByLocation(
    @Query() query: WinningAllStoresDto
  ): Promise<FindAllResponse<WinningRegionEntity[]>> {
    const { province, city } = query;
    const data = await this.regionService.findByLocation(province, city);

    return {
      status: 'success',
      data,
    };
  }

  // 특정 회차 1등 배출 점 가져오기
  @Get('winning/:drawNumber')
  async getWinningRegionsByDrawNumber(
    @Param('drawNumber', ParseIntPipe) drawNumber: number
  ): Promise<FindAllResponse<WinningRegionEntity[]>> {
    const data = await this.regionService.findByDrawNumber(drawNumber);
    return {
      status: 'success',
      data,
    };
  }

  // 로또 판매점 가져오기
  @Get('all-stores')
  async getAllStores(
    @Query() query: AllStoresByAdressDto
  ): Promise<FindAllResponse<StoreInfo[]>> {
    const { province, city } = query;
    const data = await this.regionService.fetchAllStores(province, city);
    return {
      status: 'success',
      data,
    };
  }
}
