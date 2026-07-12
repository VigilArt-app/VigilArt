import { PrismaClient } from "@vigilart/shared/server";
import { DmcaPlatformCreate } from "@vigilart/shared";
import {
    DeviantArtDmcaFormJSON,
    InstagramDmcaFormJSON,
    EtsyDmcaFormJSON,
    OtherDmcaFormJSON,
    PinterestDmcaFormJSON,
    RedbubbleDmcaFormJSON,
    TumblrDmcaFormJSON,
    XDmcaFormJSON
} from "@vigilart/shared";
import Redis from "ioredis";

const platforms: Array<DmcaPlatformCreate> = [
    DeviantArtDmcaFormJSON,
    EtsyDmcaFormJSON,
    InstagramDmcaFormJSON,
    OtherDmcaFormJSON,
    PinterestDmcaFormJSON,
    RedbubbleDmcaFormJSON,
    TumblrDmcaFormJSON,
    XDmcaFormJSON
];

async function clearDmcaPlatformCache() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl)
        return;

    const redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null
    });
    redis.on("error", () => undefined);

    try {
        await redis.connect();

        let cursor = "0";
        const keys: string[] = [];

        do {
            const [nextCursor, batch] = await redis.scan(cursor, "MATCH", "dmca_platforms:*", "COUNT", 100);
            cursor = nextCursor;
            keys.push(...batch);
        } while (cursor !== "0");
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`🧹 Cleared ${keys.length} cached DMCA platform entries.`);
        }
    } catch {
        console.warn("⚠️ Skipping DMCA platform cache clear: Redis is unavailable.");
    } finally {
        if (redis.status !== "end")
            redis.disconnect();
    }
}

export const seedPlatforms = async (prisma: PrismaClient) => {
    console.info(`Seeding ${platforms.length} platforms...`);
    await prisma.$transaction(
        platforms.map(platform => prisma.dmcaPlatform.upsert({
            where: { slug: platform.slug },
            update: (platform as any),
            create: (platform as any)
        }))
    );
    await clearDmcaPlatformCache();
}
