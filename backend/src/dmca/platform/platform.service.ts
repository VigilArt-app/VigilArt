import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { DmcaPlatformGet } from "@vigilart/shared/types";

@Injectable()
export class DmcaPlatformService {
    private readonly logger = new Logger(DmcaPlatformService.name);

    constructor(private prisma: PrismaService) {}

    async findAll(): Promise<DmcaPlatformGet[]> {
        this.logger.log("Finding all DMCA platforms");
        return this.prisma.dmcaPlatform.findMany() as unknown as Promise<DmcaPlatformGet[]>;
    }

    async findBySlug(slug: string): Promise<DmcaPlatformGet> {
        this.logger.log(`Finding DMCA platform with slug: ${slug}`);
        return this.prisma.dmcaPlatform.findUniqueOrThrow({
            where: { slug }
        }) as unknown as Promise<DmcaPlatformGet>;
    }
}
