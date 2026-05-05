import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type {
  AuthAccessToken,
  AuthResponse,
  AuthSessionResponse,
  AuthTokens,
  Login,
  SignUp,
  UserGet
} from "@vigilart/shared/types";
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

  private getCookieOptions(maxAge?: number) {
    const isProduction = process.env.NODE_ENV === "production";

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      path: "/",
      ...(typeof maxAge === "number" ? { maxAge } : {})
    };
  }

  private isMobileClient(request?: Request): boolean {
    return request?.header("x-client-type")?.toLowerCase() === "mobile";
  }

  private buildAuthSessionResponse(
    user: UserGet,
    tokens: AuthTokens
  ): AuthSessionResponse {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user
    };
  }

  private async generateAccessToken(
    userId: string,
    email: string
  ): Promise<string> {
    const accessTokenExpiry = this.config.get("JWT_EXPIRES") || "15m";
    return this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.config.getOrThrow<string>("JWT_SECRET"),
        expiresIn: accessTokenExpiry
      }
    );
  }

  private async generateTokens(
    userId: string,
    email: string,
    request?: Request
  ): Promise<AuthTokens> {
    const accessTokenExpiry = this.config.get("JWT_EXPIRES") || "15m";
    const refreshTokenExpiry = this.getRefreshTokenExpiry(request);
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
    await this.persistRefreshToken(userId, refreshToken, request);
    return { accessToken, refreshToken, expiresIn: accessTokenExpiry };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
    request?: Request
  ): Promise<void> {
    const refreshTokenExpiry = this.getRefreshTokenExpiry(request);
    const refreshTokenExpiryMs = this.parseExpiryToMs(refreshTokenExpiry);
    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      Number(this.config.get<number>("SALT_ROUNDS") || 10)
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + refreshTokenExpiryMs),
        deviceInfo: request ? this.extractDeviceInfo(request) : null,
        ipAddress: request ? this.extractIpAddress(request) : null
      }
    });
  }

  private getRefreshTokenExpiry(request?: Request) {
    if (request && this.isMobileClient(request))
      return this.config.get("JWT_MOBILE_REFRESH_EXPIRES") || "3650d";
    return this.config.get("JWT_REFRESH_EXPIRES") || "7d";
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

  private setAccessTokenCookie(response: Response, accessToken: string): void {
    const accessTokenExpiry = this.config.get("JWT_EXPIRES") || "15m";

    response.cookie(
      "auth_token",
      accessToken,
      this.getCookieOptions(this.parseExpiryToMs(accessTokenExpiry))
    );
  }

  private setAuthCookies(response: Response, tokens: AuthTokens): void {
    const accessTokenExpiry = this.config.get("JWT_EXPIRES") || "15m";
    const refreshTokenExpiry = this.config.get("JWT_REFRESH_EXPIRES") || "7d";

    response.cookie(
      "auth_token",
      tokens.accessToken,
      this.getCookieOptions(this.parseExpiryToMs(accessTokenExpiry))
    );
    response.cookie(
      "refresh_token",
      tokens.refreshToken,
      this.getCookieOptions(this.parseExpiryToMs(refreshTokenExpiry))
    );
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie("auth_token", this.getCookieOptions());
    response.clearCookie("refresh_token", this.getCookieOptions());
  }

  async login(
    response: Response,
    request: Request,
    { email, password }: Login
  ): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    const tokens = await this.generateTokens(user.id, user.email, request);
    const { password: hashedPassword, ...userProfile } = user;

    this.setAuthCookies(response, tokens);
    return this.isMobileClient(request)
      ? this.buildAuthSessionResponse(userProfile, tokens)
      : userProfile;
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
  ): Promise<AuthAccessToken | void> {
    if (!oldRefreshToken)
      throw new UnauthorizedException("User is not logged in.");

    const accessToken = await this.generateAccessToken(userId, email);

    this.setAccessTokenCookie(response, accessToken);
    if (!this.isMobileClient(request))
      return;
    return {
      accessToken,
      expiresIn: this.config.get("JWT_EXPIRES") || "15m"
    };
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
