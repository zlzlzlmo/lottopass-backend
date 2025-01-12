import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
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
    const { email, nickname: nickname, password } = createUserDto;

    const isEmailTaken = await this.isEmailTaken(email);
    const isnicknameTaken = await this.isnicknameTaken(nickname);

    if (isEmailTaken) {
      throw new ConflictException('이메일이 이미 사용 중입니다.');
    }

    if (isnicknameTaken) {
      throw new ConflictException('닉네임 이미 사용 중입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      nickname: nickname,
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
    if (updateUserDto.nickname) user.nickname = updateUserDto.nickname;
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

  async isnicknameTaken(nickname: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { nickname: nickname },
    });
    console.log('nickname : ', user);
    return !!user;
  }
  async findById(id: string): Promise<Partial<UserEntity>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'nickname'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    try {
      await this.userRepository.save(user);
      return true;
    } catch (error) {
      return false;
    }
  }
}
