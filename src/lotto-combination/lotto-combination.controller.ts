import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LottoCombinationService } from './lotto-combination.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserEntity } from 'src/user/user.entity';
import { FindAllResponse } from 'lottopass-shared';
import { LottoCombinationEntity } from './lotto-combination.entity';

@Controller('lotto-combination')
@UseGuards(AuthGuard('jwt'))
export class LottoCombinationController {
  constructor(
    private readonly lottoCombinationService: LottoCombinationService
  ) {}

  @Post('save')
  async saveCombination(
    @Req() req: Request,
    @Body('combination') combination: number[]
  ): Promise<FindAllResponse<LottoCombinationEntity>> {
    const user = req.user as UserEntity;
    const data = await this.lottoCombinationService.saveCombinations(
      user,
      combination
    );

    return {
      status: 'success',
      data,
    };
  }

  @Get()
  async getUserCombinations(
    @Req() req: Request
  ): Promise<FindAllResponse<LottoCombinationEntity[]>> {
    const user = req.user as UserEntity;

    const data = await this.lottoCombinationService.getUserCombinations(
      user.id
    );
    return {
      status: 'success',
      data,
    };
  }

  @Delete(':id')
  async deleteCombination(
    @Req() req: Request,
    @Param('id') combinationId: string
  ): Promise<FindAllResponse<boolean>> {
    const user = req.user as UserEntity;
    await this.lottoCombinationService.deleteCombination(combinationId, user);
    return {
      status: 'success',
      data: true,
    };
  }
}
