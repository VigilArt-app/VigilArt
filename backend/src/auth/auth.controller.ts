import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common";
import type { Request, Response } from "express";
import { LoginDTO, SignUpDTO, UserGetDTO } from "@vigilart/shared/schemas";
import type { UserGet } from "@vigilart/shared/types";
import { AuthService } from "./auth.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody } from "@nestjs/swagger";
import { JwtRefreshAuthGuard } from "../common/guards/jwt-refresh-auth.guard";
import type { AuthenticatedRequest } from "./auth";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiEndpoint({
    summary: "Register a new user",
    success: {
      status: HttpStatus.CREATED,
      type: UserGetDTO
    },
    errors: [HttpStatus.CONFLICT],
    protected: false
  })
  @ApiBody({ type: SignUpDTO })
  async signUp(@Body() signUpDto: SignUpDTO): Promise<UserGet> {
    return this.authService.signUp(signUpDto);
  }

  @Post("login")
  @ApiEndpoint({
    summary: "Authenticate a user and obtain JWT tokens via httpOnly cookies",
    success: {
      status: HttpStatus.OK,
      type: UserGetDTO
    },
    errors: [HttpStatus.UNAUTHORIZED],
    protected: false
  })
  @ApiBody({ type: LoginDTO })
  async login(
    @Body() loginDto: LoginDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserGet> {
    return this.authService.login(response, request, loginDto);
  }

  @Post("refresh")
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    summary: "Refresh access token using refresh token from httpOnly cookie",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.UNAUTHORIZED]
  })
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return this.authService.refreshTokens(
      response,
      req,
      req.user.id,
      req.user.email,
      req.user.refreshToken
    );
  }

  @Post("logout")
  @UseGuards(JwtRefreshAuthGuard)
  @ApiEndpoint({
    summary: "Logout user and invalidate refresh token",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.UNAUTHORIZED]
  })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return this.authService.logout(response, req.user.id, req.user.refreshToken);
  }

  @Post("logout-all")
  @ApiEndpoint({
    summary: "Logout user from all devices",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.UNAUTHORIZED],
    protected: true
  })
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return this.authService.logoutAllDevices(response, req.user.id);
  }
}
