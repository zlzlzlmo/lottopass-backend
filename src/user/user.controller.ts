import { Controller, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { FindAllResponse } from 'lottopass-shared';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './update.user.dto';

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

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<FindAllResponse<UserEntity>> {
    const data = await this.userService.updateUser(id, updateUserDto);
    return {
      status: 'success',
      data,
    };
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<FindAllResponse<null>> {
    await this.userService.deleteUser(id);
    return {
      status: 'success',
      data: null,
    };
  }
}
