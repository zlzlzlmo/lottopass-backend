import {
  Controller,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { FindAllResponse } from 'lottopass-shared';
import { UserEntity } from './user.entity';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @Req() req: Request
  ): Promise<FindAllResponse<Partial<UserEntity>>> {
    const userId = req.user['id'];

    const data = await this.userService.findById(userId);
    return {
      status: 'success',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-profile')
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<FindAllResponse<UserEntity>> {
    const userId = req.user['id'];
    const data = await this.userService.updateUser(userId, updateUserDto);
    return {
      status: 'success',
      data,
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() { email, newPassword }: { email: string; newPassword: string }
  ): Promise<FindAllResponse<boolean>> {
    const data = await this.userService.resetPassword(email, newPassword);
    return {
      status: 'success',
      data,
    };
  }
}
