import { Injectable, Logger, NotImplementedException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { DmcaNoticeGet, DmcaNoticeCreate, DmcaNoticeUpdate } from "@vigilart/shared/types";
import { DmcaStatus, createPayloadSchemaFromPlatform } from "@vigilart/shared";

@Injectable()
export class DmcaNoticeService {
    private readonly logger = new Logger(DmcaNoticeService.name);

    constructor(private prisma: PrismaService) {}

    async findAll(): Promise<DmcaNoticeGet[]> {
        this.logger.log("Finding all DMCA notices");
        return this.prisma.dmcaNotice.findMany();
    }

    async findByUserId(userId: string): Promise<DmcaNoticeGet[]> {
        this.logger.log(`Finding all DMCA notices for user: ${userId}`);
        return this.prisma.dmcaNotice.findMany({
            where: { userId }
        });
    }

    async findById(id: string): Promise<DmcaNoticeGet> {
        this.logger.log(`Finding DMCA notice: ${id}`);
        return this.prisma.dmcaNotice.findUniqueOrThrow({
            where: { id }
        });
    }

    private async validatePayload(platformSlug: string, payload: any): Promise<Record<string, unknown>> {
        const platform = await this.prisma.dmcaPlatform.findUniqueOrThrow({
            where: { slug: platformSlug }
        });
        const Validator = createPayloadSchemaFromPlatform(platform.formSchema as any);

        return Validator.parse(payload);
    }

    async create(data: DmcaNoticeCreate): Promise<DmcaNoticeGet> {
        const safePayload = await this.validatePayload(data.dmcaPlatformSlug, data.payload);
        const status: DmcaStatus = DmcaStatus.DRAFT;

        this.logger.log(`Creating DMCA notice for user: ${data.userId}`);
        return this.prisma.dmcaNotice.create({
            data: {
                ...data,
                payload: (safePayload as any),
                status
            }
        });
    }

    async update(id: string, data: DmcaNoticeUpdate): Promise<DmcaNoticeGet> {
        const oldData = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: { id }
        });
        if (oldData.status === DmcaStatus.SUBMITTED)
            throw new BadRequestException("Cannot update a submitted notice");

        const hasChanges =
            (data.payload && JSON.stringify(data.payload) !== JSON.stringify(oldData.payload)) ||
            (data.dmcaPlatformSlug && data.dmcaPlatformSlug !== oldData.dmcaPlatformSlug);
        if (!hasChanges)
            return oldData;

        const safePayload = data.payload ? await this.validatePayload(
            data.dmcaPlatformSlug ? data.dmcaPlatformSlug : oldData.dmcaPlatformSlug,
            data.payload
        ) : undefined;

        this.logger.log(`Updating DMCA notice: ${id}`);
        return this.prisma.dmcaNotice.update({
            where: { id },
            data: {
                payload: (safePayload as any),
                dmcaPlatformSlug: data.dmcaPlatformSlug,
                status: oldData.status === DmcaStatus.EXPORTED || oldData.status === DmcaStatus.GENERATED ? DmcaStatus.DRAFT : oldData.status
            }
        });
    }

    async updateStatus(id: string, status: DmcaStatus): Promise<DmcaNoticeGet> {
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: { id }
        });
        if (notice.status === DmcaStatus.SUBMITTED)
            throw new BadRequestException("Cannot change status of a submitted notice");
        if (notice.status === status)
            return notice;

        this.logger.log(`Updating status of DMCA notice: ${id} to ${status}`);
        return this.prisma.dmcaNotice.update({
            where: { id },
            data: { status }
        });
    }

    async delete(id: string): Promise<void> {
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: { id }
        });
        if (notice.status === DmcaStatus.SUBMITTED)
            throw new BadRequestException("Cannot delete a submitted notice");

        this.logger.log(`Deleting DMCA notice: ${id}`);
        await this.prisma.dmcaNotice.delete({
            where: { id }
        });
    }

    async generatePdf(id: string): Promise<Buffer> {
        this.logger.log(`Generating PDF for DMCA notice: ${id}`);
        // TODO: Implement PDF generation logic
        throw new NotImplementedException("PDF generation not yet implemented");
    }

    async sendNotice(id: string): Promise<void> {
        this.logger.log(`Sending DMCA notice: ${id}`);
        // TODO: Implement email sending logic
        throw new NotImplementedException("Notice sending not yet implemented");
    }
}
