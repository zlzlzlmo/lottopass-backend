import {
  Controller,
  Post,
  Put,
  Body,
  Req,
  UseGuards,
  Get,
  NotFoundException,
  Res,
  Delete,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { FindAllResponse, UserProfile } from 'lottopass-shared';
import { UserEntity } from './user.entity';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './update.user.dto';

import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt';
import { ResetPasswordUserDto } from './reset-password-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

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
  ): Promise<FindAllResponse<{ user: UserProfile; token: string }>> {
    const userId = req.user['id'];

    // 사용자 정보 업데이트
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto
    );

    // 새 JWT 발급
    const newToken = this.authService.generateJwtToken({
      id: updatedUser.id,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
    });

    // JSON 형태로 사용자 데이터와 토큰 반환
    return {
      status: 'success',
      data: {
        user: updatedUser,
        token: newToken, // 클라이언트에서 저장할 JWT
      },
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() { email, newPassword }: ResetPasswordUserDto
  ): Promise<FindAllResponse<boolean>> {
    const data = await this.userService.resetPassword(email, newPassword);
    return {
      status: 'success',
      data,
    };
  }

  @Post('check-email')
  async checkEmail(
    @Body('email') email: string
  ): Promise<FindAllResponse<boolean>> {
    const exists = await this.userService.isEmailTaken(email);
    if (!exists) {
      throw new NotFoundException(
        '이메일에 해당하는 계정이 존재하지 않습니다.'
      );
    }
    return {
      status: 'success',
      data: true,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/delete')
  async deleteAccount(
    @Req() req: Request,
    @Res() res: Response,
    @Body('password') password: string
  ): Promise<void> {
    const userId = req.user['id'];

    const user = await this.userService.findAllById(userId);

    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    if (!password) {
      throw new BadRequestException('비밀번호를 입력해주세요.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '잘못된 비밀번호입니다. 다시 확인해주세요.'
      );
    }
    await this.userService.deleteUser(userId);

    res.status(200).json({ status: 'success', data: true });
  }
}
