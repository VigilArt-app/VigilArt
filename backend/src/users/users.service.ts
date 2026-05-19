import {
  ConflictException,
  Inject,
  Injectable,
  Logger
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import type {
  UserCreate,
  UserUpdate,
  UserGet,
  User
} from "@vigilart/shared/types";
import { SubscriptionTier } from "@vigilart/shared";

const USERS_TTL = 30 * 24 * 60 * 60 * 1000;

const USER_KEY = (id: string) => {
  return `users:${id}`;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
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
    const cached = await this.cacheManager.get<UserGet>(USER_KEY(id));
    if (cached)
      return cached;

    this.logger.log(`Finding user ${id}`);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      omit: { password: true }
    });

    await this.cacheManager.set(USER_KEY(id), user, USERS_TTL);
    return user;
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
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true }
    });

    await this.cacheManager.del(USER_KEY(id));
    return user;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user ${id}`);
    await this.prisma.user.delete({
      where: {
        id
      }
    });
    await this.cacheManager.del(USER_KEY(id));
  }
}
