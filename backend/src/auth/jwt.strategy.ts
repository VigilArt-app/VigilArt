
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import type { AuthenticatedRequest, JwtPayload } from './auth';
import { Request } from 'express';

const extractAuthToken = (request: Request) => {
  const bearerToken = request
    ? ExtractJwt.fromAuthHeaderAsBearerToken()(request)
    : null;

  return request?.cookies?.['auth_token'] ?? bearerToken;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractAuthToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedRequest["user"]> {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user)
        throw new UnauthorizedException("Invalid token: user not found");

    return { id: user.id, email: user.email };
  }
}
