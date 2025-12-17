import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { LoginDto, SignUpDto, AuthResponseDto } from "@vigilart/shared/types";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  async login({ email, password }: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    const { password: hashedPassword, ...userProfile } = user;

    return {
      user: userProfile,
      accessToken,
      refreshToken: "", // TODO
      expiresIn: "" // TODO
    };
  }

  async signUp({ email, password, firstName, lastName }: SignUpDto): Promise<AuthResponseDto> {
    const userExists = await this.usersService.findByEmail(email);
    if (userExists)
      throw new ConflictException("Email already in use");

    const saltRounds = Number(this.config.get<number>("SALT_ROUNDS")) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      user,
      accessToken,
      refreshToken: "", // TODO
      expiresIn: "" // TODO
    };
  }
}
