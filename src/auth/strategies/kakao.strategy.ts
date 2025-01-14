import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_API_KEY'),
      clientSecret: '',
      callbackURL: `${configService.get<string>(
        'BACKEND_BASE_URL'
      )}/auth/kakao/callback`,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, username, _json } = profile;
    return {
      id,
      email: _json.kakao_account?.email || null,
      name: username || _json.properties?.nickname,
      picture: _json.properties?.profile_image,
      provider: 'Kakao',
    };
  }
}
