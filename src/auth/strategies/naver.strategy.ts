import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID'),
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>(
        'BACKEND_BASE_URL'
      )}/auth/naver/callback`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, _json } = profile;
    console.log('profile : ', profile);
    return {
      id,
      email: _json.email,
      name: _json.nickname,
      picture: _json.profile_image,
      provider: 'Naver',
    };
  }
}
