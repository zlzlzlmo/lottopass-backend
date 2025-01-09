import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() userData: CreateUserDto) {
    try {
      await this.userService.registerUser(userData);
      return { status: 'success', message: '회원가입이 완료되었습니다.' };
    } catch (error) {
      if (error instanceof ConflictException) {
        return { status: 'error', message: error.message };
      }
      throw error;
    }
  }
}
