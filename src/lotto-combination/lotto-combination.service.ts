// src/lotto/lotto-combination.service.ts
import { Injectable } from '@nestjs/common';
import { LottoCombinationRepository } from './lotto-combination.repository';
import { UserEntity } from 'src/user/user.entity';
import { LottoCombinationEntity } from './lotto-combination.entity';

@Injectable()
export class LottoCombinationService {
  constructor(
    private readonly lottoCombinationRepository: LottoCombinationRepository
  ) {}

  async saveCombinations(
    user: UserEntity,
    combinations: number[]
  ): Promise<LottoCombinationEntity> {
    return this.lottoCombinationRepository.saveCombinations(user, combinations);
  }

  async getUserCombinations(userId: string): Promise<LottoCombinationEntity[]> {
    return this.lottoCombinationRepository.findByUser(userId);
  }

  async deleteCombination(
    combinationId: string,
    user: UserEntity
  ): Promise<void> {
    await this.lottoCombinationRepository.deleteCombination(
      combinationId,
      user
    );
  }
}
