import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type {
    DmcaNoticeGet,
    DmcaNoticeCreate,
    DmcaNoticeUpdate,
    DmcaNoticeEmailResponse,
    DmcaNoticeFileResponse,
    DmcaPlatformGet,
    DmcaProfileGet,
    InputJsonValue,
    JsonObject
} from "@vigilart/shared/types";
import {
    DmcaStatus,
    createPayloadSchemaFromPlatform,
    StandardDmcaPayload
} from "@vigilart/shared";
import PDFDocument from "pdfkit";

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

    private async validatePayload(platformSlug: string, payload: unknown) {
        const platform = await this.prisma.dmcaPlatform.findUniqueOrThrow({
            where: { slug: platformSlug }
        }) as unknown as DmcaPlatformGet;
        const Validator = createPayloadSchemaFromPlatform(platform.formSchema);

        return Validator.parse(payload) as InputJsonValue;
    }

    async create(data: DmcaNoticeCreate): Promise<DmcaNoticeGet> {
        const safePayload = await this.validatePayload(data.dmcaPlatformSlug, data.payload);
        const status = DmcaStatus.DRAFT;

        this.logger.log(`Creating DMCA notice for user: ${data.userId}`);
        return this.prisma.dmcaNotice.create({
            data: {
                ...data,
                payload: safePayload,
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
                payload: safePayload,
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

    async generatePdf(id: string): Promise<DmcaNoticeFileResponse> {
        this.logger.log(`Generating PDF for DMCA notice: ${id}`);
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: { id },
            include: {
                dmcaPlatform: true
            }
        });

        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));

        doc.fontSize(20).text("DMCA Takedown Notice", { align: "center" });
        doc.moveDown();

        doc.fontSize(12).text(`To: ${notice.dmcaPlatform.displayName} (${notice.dmcaPlatform.email})`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();

        doc.text("Dear Copyright Agent,");
        doc.moveDown();
        doc.text("I am writing to report copyright infringement found on your platform. I have a good faith belief that the use of the material currently appearing on your service is not authorized by the copyright owner, its agent, or the law.");
        doc.moveDown();

        if (!notice.payload || typeof notice.payload !== "object" || Array.isArray(notice.payload))
            throw new BadRequestException("Invalid payload");
        const payload = notice.payload as StandardDmcaPayload;
        if (payload.infringing_content && payload.infringing_content.infringements) {
            doc.text("Infringing Content:", { underline: true });
            doc.moveDown(0.5);
            payload.infringing_content.infringements.forEach((item, index: number) => {
                let infringingUrl = item.infringing_url;
                let originalWorkTitle = item.original_work_title || "N/A";
                let originalWorkUrl = item.original_work_url;

                if (!originalWorkUrl && payload.infringing_content?.original_work_url)
                    originalWorkUrl = payload.infringing_content.original_work_url;
                if (notice.dmcaPlatformSlug === "INSTAGRAM" && payload.contact_information?.original_work_url)
                    originalWorkUrl = payload.contact_information.original_work_url;
                doc.text(`${index + 1}. Infringing URL: ${infringingUrl}`);
                doc.text(`   Original Work: ${originalWorkTitle} (${originalWorkUrl || "See above/below"})`);
                doc.moveDown(0.5);
            });
        }
        doc.moveDown();

        if (payload.contact_information) {
            const info = payload.contact_information;
            doc.text("Sender Information:", { underline: true });
            doc.text(`Name: ${info.full_name}`);
            doc.text(`Email: ${info.email}`);
            if (info.street_address)
                doc.text(`Address: ${info.street_address}${info.city || info.country ? ", " : ""}${info.city + " " || ""}${info.country || ""}`);
            else if (info.city && info.country)
                doc.text(`Address: ${info.city + " " + info.country}`);
            else if (info.country)
                doc.text(`Country: ${info.country}`);
        }
        doc.moveDown();

        doc.text("I declare under penalty of perjury that the information in this notification is accurate and that I am the owner (or authorized to act on behalf of the owner) of the exclusive right that is allegedly infringed.");
        doc.moveDown();

        if (payload.legal_declarations && payload.legal_declarations.signature)
            doc.text(`Signature: ${payload.legal_declarations.signature}`);
        else
            doc.text(`Signature: ______________________`);

        doc.end();

        return new Promise((resolve) => {
            doc.on("end", () => {
                const buffer = Buffer.concat(buffers);
                // MOCK: In production, upload buffer to Cloudflare R2 here
                // const fileUrl = await this.uploadToR2(buffer, `dmca-notices/${id}.pdf`);
                const fileUrl = `https://storage.vigilart.app/dmca-notices/${id}.pdf`;

                resolve({
                    url: fileUrl,
                    filename: `${notice.dmcaPlatformSlug}-${id}.pdf`,
                    mimeType: "application/pdf",
                    size: buffer.length
                });
            });
        });
    }

    async getNoticeEmail(id: string): Promise<DmcaNoticeEmailResponse> {
        this.logger.log(`Generating email for DMCA notice: ${id}`);
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: { id },
            include: {
                dmcaPlatform: true
            }
        });
        const platform = notice.dmcaPlatform;
        const payload = notice.payload as StandardDmcaPayload;

        const subject = `DMCA Takedown Notice - ${platform.displayName}`;
        let body = `To: ${platform.displayName} Copyright Agent\n\n`;

        body += `I am writing to report copyright infringement found on your platform. I have a good faith belief that the use of the material currently appearing on your service is not authorized by the copyright owner, its agent, or the law.\n\n`;
        body += `Infringing Content:\n`;
        if (payload.infringing_content && payload.infringing_content.infringements) {
            payload.infringing_content.infringements.forEach((item, index: number) => {
                let infringingUrl = item.infringing_url;
                let originalWorkTitle = item.original_work_title || "N/A";
                let originalWorkUrl = item.original_work_url;

                if (!originalWorkUrl && payload.infringing_content?.original_work_url)
                    originalWorkUrl = payload.infringing_content.original_work_url;
                if (notice.dmcaPlatformSlug === "INSTAGRAM" && payload.contact_information?.original_work_url)
                    originalWorkUrl = payload.contact_information.original_work_url;
                body += `${index + 1}. Infringing URL: ${infringingUrl}\n`;
                body += `   Original Work: ${originalWorkTitle} (${originalWorkUrl || "See global link"})\n\n`;
            });
        }
        if (payload.contact_information) {
            const info = payload.contact_information;

            body += `Sender Information:\n`;
            body += `Name: ${info.full_name}\n`;
            body += `Email: ${info.email}\n`;
            if (info.street_address)
                body += `Address: ${info.street_address}${info.city || info.country ? ", " : ""}${info.city + " " || ""}${info.country || ""}\n\n`;
            else if (info.city && info.country)
                body += `Address: ${info.city + " " + info.country}\n\n`;
            else if (info.country)
                body += `Country: ${info.country}\n\n`;
        }
        body += `I declare under penalty of perjury that the information in this notification is accurate and that I am the owner (or authorized to act on behalf of the owner) of the exclusive right that is allegedly infringed.\n\n`;
        if (payload.legal_declarations && payload.legal_declarations.signature)
            body += `Signature: ${payload.legal_declarations.signature}`;
        return {
            to: platform.email,
            subject,
            body
        };
    }
}
