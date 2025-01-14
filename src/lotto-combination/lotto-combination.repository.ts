// src/lotto/lotto-combination.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { LottoCombinationEntity } from './lotto-combination.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LottoCombinationRepository {
  private repository: Repository<LottoCombinationEntity>;

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {
    this.repository = this.dataSource.getRepository(LottoCombinationEntity);
  }

  async saveCombinations(
    user: UserEntity,
    combination: number[]
  ): Promise<LottoCombinationEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (!existingUser) {
      throw new Error('User does not exist in the database.');
    }

    const lottoCombination = this.repository.create({
      user: { id: existingUser.id },
      combination,
    });

    try {
      return await this.repository.save(lottoCombination);
    } catch (error) {
      throw error;
    }
  }

  async findByUser(userId: string): Promise<LottoCombinationEntity[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async deleteCombination(
    combinationId: string,
    user: UserEntity
  ): Promise<void> {
    const combination = await this.repository.findOne({
      where: { id: combinationId, user: { id: user.id } },
    });

    if (!combination) {
      throw new Error('Combination does not exist in the database.');
    }

    await this.repository.remove(combination);
  }
}
