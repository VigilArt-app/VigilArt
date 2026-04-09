import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { DmcaProfileGet, DmcaProfileCreate, DmcaProfileUpdate } from "@vigilart/shared/types";

@Injectable()
export class DmcaProfileService {
    private readonly logger = new Logger(DmcaProfileService.name);

    constructor(private prisma: PrismaService) {}

    async findAll(): Promise<DmcaProfileGet[]> {
        this.logger.log("Finding all DMCA profiles");
        return this.prisma.dmcaProfile.findMany();
    }

    async findByUserId(userId: string): Promise<DmcaProfileGet> {
        this.logger.log(`Finding DMCA profile for user: ${userId}`);
        return this.prisma.dmcaProfile.findUniqueOrThrow({
            where: { userId }
        });
    }

    async create(userId: string, data: DmcaProfileCreate): Promise<DmcaProfileGet> {
        this.logger.log(`Creating DMCA profile for user: ${userId}`);
        return this.prisma.dmcaProfile.create({
            data: {
                ...data,
                userId
            }
        });
    }

    async update(userId: string, data: DmcaProfileUpdate): Promise<DmcaProfileGet> {
        this.logger.log(`Updating DMCA profile for user: ${userId}`);
        return this.prisma.dmcaProfile.update({
            where: { userId },
            data
        });
    }

    async delete(userId: string): Promise<void> {
        this.logger.log(`Deleting DMCA profile for user: ${userId}`);
        await this.prisma.dmcaProfile.delete({
            where: { userId }
        });
    }
}
