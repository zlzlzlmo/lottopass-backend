import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {}

  async registerUser(userData: {
    phoneNumber: string;
    loginId: string;
    password: string;
    name: string;
    nickname: string;
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    gender: string;
  }) {
    const { phoneNumber, loginId, nickname, password } = userData;

    // 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: [{ phoneNumber }, { loginId }, { nickname }],
    });

    if (existingUser) {
      throw new ConflictException('중복된 정보가 있습니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }
}
