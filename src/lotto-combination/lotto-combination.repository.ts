// src/lotto/lotto-combination.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LottoCombinationEntity } from './lotto-combination.entity';

@Injectable()
export class LottoCombinationRepository {
  private repository: Repository<LottoCombinationEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(LottoCombinationEntity);
  }

  async saveCombinations(
    user: UserEntity,
    combinations: number[][]
  ): Promise<LottoCombinationEntity[]> {
    const savedCombinations = [];
    for (const combination of combinations) {
      const lottoCombination = this.repository.create({
        user,
        combination,
      });
      savedCombinations.push(await this.repository.save(lottoCombination));
    }
    return savedCombinations;
  }

  async findByUser(userId: string): Promise<LottoCombinationEntity[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async deleteCombination(
    combinationId: string,
    user: UserEntity
  ): Promise<void> {
    await this.repository.delete({ id: combinationId, user });
  }
}
