import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "../../prisma/prisma.service";
import type { DmcaPlatformGet } from "@vigilart/shared/types";

const PLATFORM_TTL = 30 * 24 * 60 * 60 * 1000;

const PLATFORMS_ALL_KEY = "dmca_platforms:all";

const PLATFORM_SLUG_KEY = (slug: string) => {
  return `dmca_platforms:${slug}`;
}

@Injectable()
export class DmcaPlatformService {
    private readonly logger = new Logger(DmcaPlatformService.name);

    constructor(
        private prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    async findAll(): Promise<DmcaPlatformGet[]> {
        const cached = await this.cacheManager.get<DmcaPlatformGet[]>(PLATFORMS_ALL_KEY);
        if (cached)
            return cached;

        this.logger.log("Finding all DMCA platforms");
        const platforms = await this.prisma.dmcaPlatform.findMany() as unknown as DmcaPlatformGet[];

        await this.cacheManager.set(PLATFORMS_ALL_KEY, platforms, PLATFORM_TTL);
        return platforms;
    }

    async findBySlug(slug: string): Promise<DmcaPlatformGet> {
        const cached = await this.cacheManager.get<DmcaPlatformGet>(PLATFORM_SLUG_KEY(slug));
        if (cached)
            return cached;

        this.logger.log(`Finding DMCA platform with slug: ${slug}`);
        const platform = await this.prisma.dmcaPlatform.findUniqueOrThrow({
            where: { slug }
        }) as unknown as DmcaPlatformGet;

        await this.cacheManager.set(PLATFORM_SLUG_KEY(slug), platform, PLATFORM_TTL);
        return platform;
    }
}
