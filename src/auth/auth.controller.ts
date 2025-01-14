import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { FindAllResponse, UserProfile } from 'lottopass-shared';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { LoginDto } from 'src/user/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  @Post('request-verification')
  async requestVerificationCode(
    @Body() dto: RequestVerificationDto
  ): Promise<FindAllResponse<boolean>> {
    await this.authService.requestVerificationCode(dto);
    return { status: 'success', data: true };
  }

  @Post('verify-code')
  async verifyCode(
    @Body() dto: VerifyCodeDto
  ): Promise<FindAllResponse<boolean>> {
    await this.authService.verifyCode(dto);
    return { status: 'success', data: true };
  }

  @Get('me')
  getProfile(
    @Req() req: Request
  ): FindAllResponse<Pick<UserProfile, 'email' | 'nickname'>> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization 헤더가 없습니다.');
    }

    const jwt = authHeader.split(' ')[1];

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new UnauthorizedException('JWT_SECRET이 설정되지 않았습니다.');
    }

    try {
      const payload = this.jwtService.verify<UserProfile>(jwt, {
        secret: jwtSecret,
      });

      // 사용자 정보 반환
      return {
        status: 'success',
        data: {
          email: payload.email,
          nickname: payload.nickname,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 JWT입니다.');
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto
  ): Promise<FindAllResponse<{ token: string }>> {
    const token = await this.authService.login(loginDto);

    return {
      status: 'success',
      data: {
        token,
      },
    };
  }
}
