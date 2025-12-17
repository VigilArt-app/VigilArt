import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { Login, SignUp, AuthResponse } from "@vigilart/shared/schemas";
import type { LoginDto, SignUpDto } from "@vigilart/shared/types";
import { AuthService } from "./auth.service";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { ApiBody } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiEndpoint({
    summary: "Register a new user",
    success: {
        status: HttpStatus.CREATED,
        type: AuthResponse
    },
    errors: [HttpStatus.CONFLICT],
    protected: false
  })
  @ApiBody({ type: SignUp })
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post("login")
  @ApiEndpoint({
    summary: "Authenticate a user and obtain a JWT token",
    success: {
        status: HttpStatus.OK,
        type: AuthResponse
    },
    errors: [HttpStatus.UNAUTHORIZED],
    protected: false
  })
  @ApiBody({ type: Login })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }
}
