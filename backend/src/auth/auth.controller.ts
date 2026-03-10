import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { LoginDTO, SignUpDTO, AuthResponseDTO } from "@vigilart/shared/schemas";
import { AuthResponse } from "@vigilart/shared/types";
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
      type: AuthResponseDTO
    },
    errors: [HttpStatus.CONFLICT],
    protected: false
  })
  @ApiBody({ type: SignUpDTO })
  async signUp(@Body() signUpDto: SignUpDTO): Promise<AuthResponse> {
    return await this.authService.signUp(signUpDto);
  }

  @Post("login")
  @ApiEndpoint({
    summary: "Authenticate a user and obtain a JWT token",
    success: {
      status: HttpStatus.OK,
      type: AuthResponseDTO
    },
    errors: [HttpStatus.UNAUTHORIZED],
    protected: false
  })
  @ApiBody({ type: LoginDTO })
  async login(@Body() loginDto: LoginDTO): Promise<AuthResponse> {
    return await this.authService.login(loginDto);
  }
}
