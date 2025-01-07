import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(profile: any): Promise<any> {
    const { emails, name, photos } = profile;

    const user = {
      email: emails?.[0]?.value || null,
      firstName: name?.givenName || null,
      lastName: name?.familyName || null,
      picture: photos?.[0]?.value || null,
    };

    return user;
  }
}
