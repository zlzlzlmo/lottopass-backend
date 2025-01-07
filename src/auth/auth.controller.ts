import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { FindAllResponse, UserProfile } from 'lottopass-shared';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  @Get('me')
  getProfile(@Req() req: Request): FindAllResponse<UserProfile> {
    const jwt = req.cookies.jwt;

    if (!jwt) {
      throw new UnauthorizedException('로그인 상태가 아닙니다.');
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException(
        'JWT_SECRET 환경 변수가 설정되지 않았습니다.'
      );
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

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    res.json({
      status: 'success',
      redirect: `${this.configService.get<string>('FRONTEND_BASE_URL')}`,
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // 구글인증 시작
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    interface GoogleUser {
      id: string;
      email: string;
      name: string;
      picture: string;
    }

    const user = req.user as GoogleUser;

    const token = this.jwtService.sign(
      {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000, // 1시간
      sameSite: 'strict',
    });

    res.redirect(`${this.configService.get<string>('FRONTEND_BASE_URL')}/`);
  }
}
