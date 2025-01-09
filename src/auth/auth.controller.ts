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
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { FindAllResponse, UserProfile } from 'lottopass-shared';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

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

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    return res.json({
      status: 'success',
      message: '로그아웃되었습니다.',
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google 로그인 페이지로 리디렉션
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    // Kakao OAuth 인증 시작
  }

  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth() {
    // Naver OAuth 인증 시작
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user;

    await this.handleSocialRedirect(googleUser, res);
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const kakaoUser = req.user;

    await this.handleSocialRedirect(kakaoUser, res);
  }

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const naverUser = req.user;

    await this.handleSocialRedirect(naverUser, res);
  }

  private async handleSocialRedirect(user, res: Response) {
    // try {
    //   const userData = await this.authService.handleSocialLogin(user);
    //   const token = this.jwtService.sign(
    //     {
    //       id: userData.providerId,
    //       email: userData.email,
    //       name: userData.name,
    //       picture: userData.picture,
    //     },
    //     {
    //       secret: this.configService.get<string>('JWT_SECRET'),
    //       expiresIn: '1h',
    //     }
    //   );
    //   res.cookie('jwt', token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     maxAge: 3600 * 1000, // 1시간
    //     sameSite: 'strict',
    //   });
    //   res.redirect(`${this.configService.get<string>('FRONTEND_BASE_URL')}/`);
    // } catch (error) {
    //   console.error('Error during social login redirect:', error);
    //   res.redirect(
    //     `${this.configService.get<string>(
    //       'FRONTEND_BASE_URL'
    //     )}/login?error=true`
    //   );
    // }
  }
}
