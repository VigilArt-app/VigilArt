import {
  Injectable,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DEFAULT_SUBSCRIPTION_TIER, DEFAULT_AVATAR_URL } from "@vigilart/shared/constants";
import type { UserCreateDto, UserUpdateDto, UserGetDto, UserDto } from "@vigilart/shared/types";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);

  async create(user: UserCreateDto): Promise<UserGetDto> {
    this.logger.log(`Creating new user ${user.email}`);
    return this.prisma.user.create({
      data: {
        ...user,
        subscriptionTier: DEFAULT_SUBSCRIPTION_TIER,
        avatar: DEFAULT_AVATAR_URL,
      },
      omit: {
        password: true,
      }
    });
  }

  async findAll(): Promise<UserGetDto[]> {
    this.logger.log("Finding all users");
    return this.prisma.user.findMany({
      omit: {
        password: true
      }
    });
  }

  async findOne(id: string): Promise<UserDto> {
    this.logger.log(`Finding user ${id}`);
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id
      }
    });
  }

  async findByEmail(email: string): Promise<UserDto> {
    this.logger.log(`Finding user with ${email}`);
    return this.prisma.user.findUniqueOrThrow({
      where: {
        email
      }
    });
  }

  async update(
    id: string,
    updateUserDto: UserUpdateDto
  ): Promise<UserGetDto> {
    this.logger.log(`Updating user ${id}`);
    return this.prisma.user.update({
      where: {
        id
      },
      data: updateUserDto,
      omit: {
        password: true
      }
    });
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user ${id}`);
    await this.prisma.user.delete({
      where: {
        id
      }
    });
  }
}
