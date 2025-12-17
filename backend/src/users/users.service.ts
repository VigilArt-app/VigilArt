import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { randomUUID } from "crypto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@vigilart/shared";
import { DEFAULT_SUBSCRIPTION_TIER, DEFAULT_AVATAR_URL } from "./constants";

export type UserProfile = Omit<User, "password">;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);

  async create({
    email,
    password,
    firstName,
    lastName,
  }: CreateUserDto): Promise<UserProfile | undefined> {
    const userData = {
      id: randomUUID(),
      email,
      password,
      firstName,
      lastName,
      subscriptionTier: DEFAULT_SUBSCRIPTION_TIER,
      avatar: DEFAULT_AVATAR_URL,
    };

    this.logger.log(`Creating new user ${email}`);
    try {
      return await this.prisma.user.create({
        data: userData,
        omit: {
          password: true,
        },
      });
    } catch (e: any) {
      if (e.code == "P2002") {
        throw new ConflictException("Email already in use");
      }
    }
  }

  async findAll(): Promise<UserProfile[]> {
    this.logger.log("Finding all users");
    try {
      return await this.prisma.user.findMany({
        omit: {
          password: true,
        },
      });
    } catch (_) {
      throw new InternalServerErrorException("Error when retrieving all users");
    }
  }

  async findOne(id: string): Promise<User | null> {
    this.logger.log(`Finding user ${id}`);
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user with ${email}`);
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserProfile | undefined> {
    this.logger.log(`Updating user ${id}`);
    try {
      return await this.prisma.user.update({
        where: {
          id,
        },
        data: updateUserDto,
        omit: {
          password: true,
        },
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException(`User ${id} not found`);
      }
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user ${id}`);
    try {
      await this.prisma.user.delete({
        where: {
          id,
        },
        omit: {
          password: true,
        },
      });
    } catch (e: any) {
      if (e.code == "P2025") {
        throw new NotFoundException(`User ${id} not found`);
      }
    }
  }
}
