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

@Controller('lotto-combination')
@UseGuards(AuthGuard('jwt'))
export class LottoCombinationController {
  constructor(
    private readonly lottoCombinationService: LottoCombinationService
  ) {}

  @Post('save')
  async saveCombinations(
    @Req() req: Request,
    @Body('combinations') combinations: number[][]
  ) {
    const user = req.user as UserEntity;
    return this.lottoCombinationService.saveCombinations(user, combinations);
  }

  @Get()
  async getUserCombinations(@Req() req: Request) {
    const user = req.user as UserEntity;
    return this.lottoCombinationService.getUserCombinations(user.id);
  }

  @Delete(':id')
  async deleteCombination(
    @Req() req: Request,
    @Param('id') combinationId: string
  ) {
    const user = req.user as UserEntity;
    await this.lottoCombinationService.deleteCombination(combinationId, user);
    return { status: 'success' };
  }
}
