import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      // 유효한 토큰일 경우 사용자 정보를 반환
      return {
        id: payload.id,
        email: payload.email,
        nickname: payload.nickname,
      };
    } catch (error) {
      console.error('JWT validation error:', error);
      throw new UnauthorizedException('유효하지 않은 JWT 토큰입니다.');
    }
  }
}
