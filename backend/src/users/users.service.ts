import {
  Inject,
  Injectable,
  Logger,
  NotFoundException
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

const USERS_TTL = 7 * 24 * 60 * 60 * 1000;

const USER_KEY = (id: string) => {
  return `users:${id}`;
}

const USER_EMAIL_KEY = (email: string) => {
  return `users:email:${email}`;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}
  private readonly logger = new Logger(UsersService.name);

  private withoutPassword({ password: _, ...user }: User): UserGet {
    return user;
  }

  private async findCached(by: { id: string } | { email: string }): Promise<User | null> {
    let id: string | undefined;

    if ("email" in by)
      id = await this.cacheManager.get<string>(USER_EMAIL_KEY(by.email)) ?? undefined;
    else
      id = by.id;
    if (id) {
      const cached = await this.cacheManager.get<User>(USER_KEY(id));
      if (cached) {
        console.log("cc ici")
        return cached;
      }
    }

    this.logger.log(`Finding user ${"id" in by ? by.id : by.email}`);
    const user = await this.prisma.user.findUnique({
      where: by
    });

    if (user) {
      await this.cacheManager.set(USER_KEY(user.id), user, USERS_TTL);
      await this.cacheManager.set(USER_EMAIL_KEY(user.email), user.id, USERS_TTL);
    }
    return user;
  }

  async create(user: UserCreate): Promise<UserGet> {
    this.logger.log(`Creating new user ${user.email}`);
    return this.prisma.user.create({
      data: {
        ...user,
        subscriptionTier: SubscriptionTier.FREE
      },
      omit: {
        password: true
      }
    });
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
    const user = await this.findCached({ id });
    if (!user)
      throw new NotFoundException(`User ${id} not found`);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findCached({ email });
  }

  async findOneWithoutPassword(id: string): Promise<UserGet> {
    return this.withoutPassword(await this.findOne(id));
  }

  async findByEmailWithoutPassword(email: string): Promise<UserGet> {
    const user = await this.findCached({ email });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return this.withoutPassword(user);
  }

  async update(
    id: string,
    updateUserDto: UserUpdate
  ): Promise<UserGet> {
    this.logger.log(`Updating user ${id}`);

    const oldUser = await this.prisma.user.findUnique({ where: { id } });
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: { password: true }
    });

    await this.cacheManager.del(USER_KEY(id));
    await this.cacheManager.del(USER_EMAIL_KEY(user.email));
    if (oldUser && oldUser.email !== user.email)
      await this.cacheManager.del(USER_EMAIL_KEY(oldUser.email));
    return user;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user ${id}`);
    const user = await this.prisma.user.findUnique({ where: { id } });

    await this.prisma.user.delete({
      where: {
        id
      }
    });
    await this.cacheManager.del(USER_KEY(id));
    if (user)
      await this.cacheManager.del(USER_EMAIL_KEY(user.email));
  }
}
