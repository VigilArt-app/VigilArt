import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import type {
  UserCreate,
  UserUpdate,
  UserGet,
  User
} from "@vigilart/shared/types";
import { SubscriptionTier } from "@vigilart/shared";
import { createHash } from "crypto";

const USERS_TTL = 7 * 24 * 60 * 60 * 1000;

const PUBLIC_USER_OMIT = {
  password: true,
  termsAcceptedAt: true,
  termsVersion: true,
  privacyVersion: true,
} as const;

type SignupAcceptance = {
  termsAcceptedAt: Date;
  termsVersion: string;
  privacyVersion: string;
};

const USER_KEY = (id: string) => {
  return `users:${id}`;
}

const USER_EMAIL_KEY = (email: string) => {
  const hash = createHash("sha256").update(email).digest("hex");

  return `users:email:${hash}`;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly storageService: StorageService
  ) {}

  private readonly logger = new Logger(UsersService.name);

  private async findCached(by: { id: string } | { email: string }): Promise<UserGet | null> {
    let id: string | undefined;

    if ("email" in by)
      id = await this.cacheManager.get<string>(USER_EMAIL_KEY(by.email)) ?? undefined;
    else
      id = by.id;
    if (id) {
      const cached = await this.cacheManager.get<User>(USER_KEY(id));
      if (cached)
        return cached;
    }

    this.logger.log(`Finding user ${"id" in by ? by.id : by.email}`);
    const user = await this.prisma.user.findUnique({
      where: by,
      omit: PUBLIC_USER_OMIT
    });

    if (user) {
      await this.cacheManager.set(USER_KEY(user.id), user, USERS_TTL);
      await this.cacheManager.set(USER_EMAIL_KEY(user.email), user.id, USERS_TTL);
    }
    return user;
  }

  async create(user: UserCreate, acceptance?: SignupAcceptance): Promise<UserGet> {
    this.logger.log(`Creating new user ${user.email}`);
    return this.prisma.user.create({
      data: {
        ...user,
        ...acceptance,
        subscriptionTier: SubscriptionTier.FREE
      },
      omit: PUBLIC_USER_OMIT
    });
  }

  async findAll(): Promise<UserGet[]> {
    this.logger.log("Finding all users");
    return this.prisma.user.findMany({
      omit: PUBLIC_USER_OMIT
    });
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });

  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findOneWithoutPassword(id: string): Promise<UserGet> {
    const user = await this.findCached({ id });
    if (!user)
      throw new NotFoundException(`User ${id} not found`);

    return user;
  }

  async findByEmailWithoutPassword(email: string): Promise<UserGet> {
    const user = await this.findCached({ email });
    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return user;
  }

  async update(
    id: string,
    updateUserDto: UserUpdate
  ): Promise<UserGet> {
    this.logger.log(`Updating user ${id}`);

    const oldUser = await this.findOneWithoutPassword(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      omit: PUBLIC_USER_OMIT
    });

    await this.cacheManager.del(USER_KEY(id));
    await this.cacheManager.del(USER_EMAIL_KEY(user.email));
    if (oldUser && oldUser.email !== user.email)
      await this.cacheManager.del(USER_EMAIL_KEY(oldUser.email));
    return user;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user ${id}`);
    const user = await this.findOneWithoutPassword(id);

    // Files go first: if storage fails, the rows that list them are still
    // there, so deleting the account again finishes the job.
    const storageKeys = await this.storageKeysOf(id);
    try {
      await this.storageService.deleteImages(storageKeys);
    } catch (error) {
      this.logger.error(
        `Failed to delete storage objects of user ${id}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw new ServiceUnavailableException(
        "Your account could not be deleted right now. Please try again in a few minutes."
      );
    }

    await this.prisma.user.delete({
      where: {
        id
      }
    });
    await this.cacheManager.del(USER_KEY(id));
    if (user)
      await this.cacheManager.del(USER_EMAIL_KEY(user.email));
  }

  // Every object stored for the account: artworks, DMCA notice PDFs and the
  // profile picture when it is a key under profiles/ (clients also accept a
  // full URL, which is not ours to delete).
  private async storageKeysOf(id: string): Promise<string[]> {
    const { avatar, artworks, dmcaNotices } = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: {
        avatar: true,
        artworks: { select: { storageKey: true } },
        dmcaNotices: { select: { id: true } }
      }
    });
    return [
      ...artworks.map(({ storageKey }) => storageKey),
      ...(avatar?.startsWith("profiles/") ? [avatar] : []),
      ...dmcaNotices.map((notice) => `dmca-notices/${notice.id}.pdf`)
    ];
  }
}
