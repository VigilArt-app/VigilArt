import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  UserCreate,
  UserUpdate,
  UserGet,
  User
} from "@vigilart/shared/types";
import { SubscriptionTier } from "@vigilart/shared";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(UsersService.name);

  async create(user: UserCreate): Promise<UserGet> {
    try {
      this.logger.log(`Creating new user ${user.email}`);
      return await this.prisma.user.create({
        data: {
          ...user,
          subscriptionTier: SubscriptionTier.FREE
        },
        omit: {
          password: true
        }
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        throw new ConflictException("Email already in use");
      }
      throw e;
    }
  }

  async findAll(): Promise<UserGet[]> {
    this.logger.log("Finding all users");
    return this.prisma.user.findMany({
      omit: {
        password: true
      }
    });
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Finding user ${id}`);
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user with ${email}`);
    return this.prisma.user.findUnique({
      where: {
        email
      }
    });
  }

  async findOneWithoutPassword(id: string): Promise<UserGet> {
    this.logger.log(`Finding user ${id}`);
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id
        },
        omit: {
          password: true
        }
      });
  }

  async findByEmailWithoutPassword(email: string): Promise<UserGet> {
    this.logger.log(`Finding user with ${email}`);
    return this.prisma.user.findUniqueOrThrow({
      where: {
        email
      },
      omit: {
        password: true
      }
    });
  }

  async update(
    id: string,
    updateUserDto: UserUpdate
  ): Promise<UserGet> {
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
