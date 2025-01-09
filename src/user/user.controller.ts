import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { FindAllResponse } from 'lottopass-shared';
import { UserEntity } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto
  ): Promise<FindAllResponse<UserEntity>> {
    const data = await this.userService.createUser(createUserDto);
    return {
      status: 'success',
      data,
    };
  }
}
