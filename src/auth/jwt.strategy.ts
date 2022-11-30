import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // todo: research more...
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) { // todo: this is the decrypted json value from JWT. Add type for this.
    return { userId: payload.sub, username: payload.username }; // as User basically
    // todo: add a db call top enrich the user profile based on userId..
  }

  // todo: Refresh JWT Token functionality
}