// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  // async findOrCreateUser(
  //   email: string,
  //   name: string,
  //   picture: string,
  //   provider: string
  // ): Promise<UserEntitiy> {
  //   let user = await this.userRepository.findByEmail(email);

  //   if (!user) {
  //     user = await this.userRepository.createUser(
  //       email,
  //       name,
  //       picture,
  //       provider
  //     );
  //   }

  //   return user;
  // }
}
