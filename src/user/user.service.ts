import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update.user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const { email, nickname, password } = createUserDto;

    const isEmailTaken = await this.isEmailTaken(email);
    const isNicknameTaken = await this.isNicknameTaken(nickname);

    if (isEmailTaken) {
      throw new ConflictException('이메일이 이미 사용 중입니다.');
    }

    if (isNicknameTaken) {
      throw new ConflictException('닉네임 이미 사용 중입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      nickName: nickname,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.nickName) user.nickName = updateUserDto.nickName;
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(user);
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    console.log('email : ', user);
    return !!user;
  }

  async isNicknameTaken(nickname: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { nickName: nickname },
    });
    console.log('nickname : ', user);
    return !!user;
  }

  async findByMe(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
