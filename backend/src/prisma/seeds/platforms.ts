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

export const seedPlatforms = async (prisma: PrismaClient) => {
    console.info(`Seeding ${platforms.length} platforms...`);
    await prisma.$transaction(
        platforms.map(platform => prisma.dmcaPlatform.upsert({
            where: { slug: platform.slug },
            update: (platform as any),
            create: (platform as any)
        }))
    );
}
