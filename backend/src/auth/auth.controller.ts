import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  Get
} from "@nestjs/common";
import type { Request, Response } from "express";
import {
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { LoginDTO, SignUpDTO, UserGetDTO, AuthSessionDTO, AuthAccessTokenDTO } from "@vigilart/shared/schemas";
import type { AuthAccessToken, AuthSessionResponse, UserGet } from "@vigilart/shared/types";
import { AuthService } from "./auth.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
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
    errors: [HttpStatus.CONFLICT]
  })
  @ApiBody({ type: SignUpDTO })
  async signUp(@Body() signUpDto: SignUpDTO): Promise<UserGet> {
    return this.authService.signUp(signUpDto);
  }

  @Post("login")
  @ApiEndpoint({
    summary: "Authenticate a web user and set auth cookies",
    protected: false,
    success: {
      status: HttpStatus.OK,
      type: UserGetDTO
    }
  })
  @ApiBody({ type: LoginDTO })
  async loginWeb(
    @Body() loginDto: LoginDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserGet> {
    return this.authService.loginWeb(response, request, loginDto);
  }

  @Post("mobile/login")
  @ApiEndpoint({
    summary: "Authenticate a mobile user and return tokens in the response body",
    protected: false,
    success: {
      status: HttpStatus.OK,
      type: AuthSessionDTO
    }
  })
  @ApiBody({ type: LoginDTO })
  async loginMobile(
    @Body() loginDto: LoginDTO,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthSessionResponse> {
    return this.authService.loginMobile(response, request, loginDto);
  }

  @Post("refresh")
  @UseGuards(JwtRefreshAuthGuard)
  @ApiEndpoint({
    summary: "Refresh access token (web: cookie only, mobile: bearer token response)",
    success: {
      status: HttpStatus.NO_CONTENT
    },
    errors: [HttpStatus.UNAUTHORIZED]
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AuthAccessTokenDTO,
    description: "Mobile clients (those presenting the refresh token as a Bearer token) receive a refreshed access token in the response body."
  })
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthAccessToken | void> {
    const result = await this.authService.refreshTokens(
      response,
      req.user.id,
      req.user.email,
      req.user.clientType,
      req.user.refreshToken
    );

    if (req.user.clientType === "mobile") {
      response.status(HttpStatus.OK);
      return result;
    }

    response.status(HttpStatus.NO_CONTENT);
    return;
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
    protected: true
  })
  async logoutAll(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    return this.authService.logoutAllDevices(response, req.user.id);
  }

  @Get("me")
  @ApiEndpoint({
    summary: "Retrieve authenticated user data",
    success: {
      status: HttpStatus.OK,
      type: UserGetDTO
    },
    protected: true
  })
  async getAuthenticatedUser(@Req() req: AuthenticatedRequest): Promise<UserGet> {
    return this.authService.me(req.user);
  }
}
