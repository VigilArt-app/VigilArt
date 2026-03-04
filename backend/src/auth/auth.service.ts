import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { Login, SignUp, AuthTokens, UserGet } from "@vigilart/shared/types";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "./auth";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  private async generateTokens(
    userId: string,
    email: string,
    request?: Request
  ): Promise<AuthTokens> {
    const accessTokenExpiry = this.config.get("JWT_EXPIRES") || "15m";
    const refreshTokenExpiry = this.config.get("JWT_REFRESH_EXPIRES") || "7d";
    const saltRounds = Number(this.config.get<number>("SALT_ROUNDS") || 10);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.getOrThrow<string>("JWT_SECRET"),
          expiresIn: accessTokenExpiry
        }
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
          expiresIn: refreshTokenExpiry
        }
      )
    ]);
    const refreshTokenExpiryMs = this.parseExpiryToMs(refreshTokenExpiry);
    const refreshTokenExpiryDate = new Date(Date.now() + refreshTokenExpiryMs);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedRefreshToken,
        expiresAt: refreshTokenExpiryDate,
        deviceInfo: request ? this.extractDeviceInfo(request) : null,
        ipAddress: request ? this.extractIpAddress(request) : null
      }
    });
    return { accessToken, refreshToken, expiresIn: accessTokenExpiry };
  }

  private extractDeviceInfo(request: Request): string {
    const userAgent = request.headers['user-agent'] || 'Unknown';
    return userAgent.substring(0, 255);
  }

  private extractIpAddress(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded)
      return (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]).trim();

    return request.ip || request.socket.remoteAddress || 'Unknown';
  }

  private parseExpiryToMs(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 15 * 60 * 1000;
    }
  }

  private setAuthCookies(response: Response, tokens: AuthTokens): void {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('auth_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });
    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie('auth_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });
  }

  async login(
    response: Response,
    request: Request,
    { email, password }: Login
  ): Promise<UserGet> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    const tokens = await this.generateTokens(user.id, user.email, request);
    const { password: hashedPassword, ...userProfile } = user;

    this.setAuthCookies(response, tokens);
    return userProfile;
  }

  async signUp({
    email,
    password,
    firstName,
    lastName
  }: SignUp): Promise<UserGet> {
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) throw new ConflictException("Email already in use");

    const saltRounds = Number(this.config.get<number>("SALT_ROUNDS") || 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });
  }

  async refreshTokens(
    response: Response,
    request: Request,
    userId: string,
    email: string,
    oldRefreshToken?: string
  ): Promise<void> {
    if (!oldRefreshToken)
      throw new UnauthorizedException("User is not logged in.");

    const userTokens = await this.prisma.refreshToken.findMany({
      where: { userId }
    });
    for (const storedToken of userTokens) {
      if (await bcrypt.compare(oldRefreshToken, storedToken.token)) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id }
        });
        break;
      }
    }

    const tokens = await this.generateTokens(userId, email, request);

    this.setAuthCookies(response, tokens);
  }

  async logout(
    response: Response,
    userId: string,
    refreshToken?: string
  ): Promise<void> {
    if (!refreshToken)
      throw new UnauthorizedException("User is not logged in.");

    const userTokens = await this.prisma.refreshToken.findMany({
      where: { userId }
    });
    for (const storedToken of userTokens) {
      if (await bcrypt.compare(refreshToken, storedToken.token)) {
        await this.prisma.refreshToken.delete({
          where: { id: storedToken.id }
        });
        break;
      }
    }

    this.clearAuthCookies(response);
  }

  async logoutAllDevices(response: Response, userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId }
    });
    this.clearAuthCookies(response);
  }

  async me(auth: AuthenticatedRequest["user"]): Promise<UserGet> {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id: auth.id,
        email: auth.email
      },
      omit: {
        password: true
      }
    });
  }
}
