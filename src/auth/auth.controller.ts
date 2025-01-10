import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
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
    console.log('dtod : ', dto);
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
  getProfile(@Req() req: Request): FindAllResponse<UserProfile> {
    const jwt = req.cookies.jwt;

    if (!jwt) {
      throw new UnauthorizedException('로그인 상태가 아닙니다.');
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new UnauthorizedException('JWT_SECRET이 설정되지 않았습니다.');
    }

    try {
      const payload = this.jwtService.verify<UserProfile>(jwt, {
        secret: jwtSecret,
      });

      return {
        status: 'success',
        data: {
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 JWT입니다.');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response): Promise<void> {
    const token = await this.authService.login(loginDto);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1일
    });

    res.status(200).json({ message: '로그인 성공' });
  }

  @Post('logout')
  logout(@Res() res: Response): void {
    // this.authService.removeRefreshToken(refreshToken);
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({ message: '로그아웃 성공' });
  }
}
