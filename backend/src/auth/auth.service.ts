import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { SignUpDto } from "./dto/sign-up.dto";
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

  async login({ email, password }: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new UnauthorizedException("Invalid credentials");
        }
        const accessToken = await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
        });
        const refreshToken = "";
        const expiresIn = ""; // TO DO
        const { password: hashedPassword, ...userProfile } = user;
        return { user: userProfile, accessToken, refreshToken, expiresIn };
      } else {
        throw new UnauthorizedException("Invalid credentials");
      }
    } catch (e: any) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  async signUp({ email, password, firstName, lastName }: SignUpDto) {
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new ConflictException("Email already in use");
    }
    const saltRounds = Number(this.config.get<number>("SALT_ROUNDS")) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });
      if (user) {
        const accessToken = await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
        });
        const refreshToken = "";
        const expiresIn = ""; // TO DO
        return { user, accessToken, refreshToken, expiresIn };
      }
    } catch (e: any) {
      throw e;
    }
  }
}
