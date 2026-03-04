import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from './auth';
import { Request } from 'express';
import * as bcrypt from "bcrypt";
import type { AuthenticatedRequest } from './auth';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<AuthenticatedRequest["user"]> {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token is required');

    const user = await this.usersService.findByEmail(payload.email);
    if (!user)
      throw new UnauthorizedException('Invalid token: user not found');

    const validTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    let isRefreshTokenValid = false;
    for (const storedToken of validTokens) {
      if (await bcrypt.compare(refreshToken, storedToken.token)) {
        isRefreshTokenValid = true;
        break;
      }
    }

    if (!isRefreshTokenValid)
      throw new UnauthorizedException('Invalid refresh token');
    return { id: user.id, email: user.email, refreshToken };
  }
}
