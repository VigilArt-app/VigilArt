import { Injectable, Logger, BadRequestException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../storage/storage.service";
import type {
    DmcaNoticeGet,
    DmcaNoticeCreate,
    DmcaNoticeUpdate,
    DmcaNoticeEmailResponse,
    DmcaNoticeFileResponse,
    DmcaNoticeGeneratedContent,
    DmcaPlatformGet,
    DmcaProfileGet,
    InputJsonValue,
    JsonObject
} from "@vigilart/shared/types";
import {
    DmcaStatus,
    createPayloadSchemaFromPlatform
} from "@vigilart/shared";
import PDFDocument from "pdfkit";

interface NecessaryProperties {
    platform: {
        name: string,
        slug: string,
        link: string,
        email: string
    },
    artist: {
        full_name: string,
        original_work_description: string,
        original_work_url: string,
        infringing_urls: string[],
        address: {
            street: string,
            aptSuite?: string,
            city: string,
            postalCode: string,
            region?: string,
            country: string
        },
        email: string,
        phone: string,
        signature: string
    }
}

@Injectable()
export class DmcaNoticeService {
    private readonly logger = new Logger(DmcaNoticeService.name);

    constructor(
        private prisma: PrismaService,
        private storage: StorageService
    ) {}

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

    async findById(userId: string, id: string): Promise<DmcaNoticeGet> {
        this.logger.log(`Finding DMCA notice: ${id}`);
        return this.prisma.dmcaNotice.findUniqueOrThrow({
            where: {
                id,
                userId
            }
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
                status,
                dmcaNoticeData: {
                    create: { }
                }
            }
        });
    }

    async update(id: string, data: DmcaNoticeUpdate): Promise<DmcaNoticeGet> {
        const oldData = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: {
                id
            }
        });
        if (oldData.status === DmcaStatus.SUBMITTED)
            throw new ConflictException("Cannot update a submitted notice");

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
                dmcaPlatformSlug: data.dmcaPlatformSlug
            }
        });
    }

    async updateStatus(userId: string, id: string, status: DmcaStatus): Promise<DmcaNoticeGet> {
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: {
                id,
                userId
            }
        });
        if (notice.status === DmcaStatus.SUBMITTED)
            throw new ConflictException("Cannot change status of a submitted notice");
        if (notice.status === status)
            return notice;

        this.logger.log(`Updating status of DMCA notice: ${id} to ${status}`);
        return this.prisma.dmcaNotice.update({
            where: { id },
            data: { status }
        });
    }

    async delete(userId: string, id: string): Promise<void> {
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: {
                id,
                userId
            }
        });
        if (notice.status === DmcaStatus.SUBMITTED)
            throw new ConflictException("Cannot delete a submitted notice");

        this.logger.log(`Deleting DMCA notice: ${id}`);
        await this.prisma.dmcaNotice.delete({
            where: { id }
        });
    }

    private loopThroughObject(payload: InputJsonValue, necessaryProperties: NecessaryProperties) {
        if (typeof payload !== "object")
            return;
        for (const [property, value] of Object.entries(payload)) {
            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (item && typeof item === "object" && !Array.isArray(item))
                        this.loopThroughObject(item, necessaryProperties);
                });
                continue;
            }
            if (value && typeof value === "object") {
                this.loopThroughObject(value, necessaryProperties);
                continue;
            }
            if (typeof value !== "string")
                continue;
            if (property.includes("full_name"))
                necessaryProperties.artist.full_name = value;
            else if (property === "original_work_description")
                necessaryProperties.artist.original_work_description = value;
            else if (property === "original_work_url")
                necessaryProperties.artist.original_work_url = value;
            else if (property === "infringing_url")
                necessaryProperties.artist.infringing_urls.push(value);
            else if (property === "street")
                necessaryProperties.artist.address.street = value;
            else if (property === "apt")
                necessaryProperties.artist.address.aptSuite = value;
            else if (property === "city")
                necessaryProperties.artist.address.city = value;
            else if (property === "region")
                necessaryProperties.artist.address.region = value;
            else if (property === "email")
                necessaryProperties.artist.email = value;
            else if (property === "phone_number")
                necessaryProperties.artist.phone = value;
            else if (property === "signature")
                necessaryProperties.artist.signature = value;
        }
    }

    private getPdfProperties(payload: JsonObject, platform: Omit<DmcaPlatformGet, "formSchema">, profile: DmcaProfileGet | null | undefined) {
        const necessaryProperties: NecessaryProperties = {
            platform: {
                name: platform.displayName ?? "[insert company name]",
                link: platform.domain || "[insert company domain]",
                email: platform.email || "[insert company DMCA email]",
                slug: platform.slug
            },
            artist: {
                full_name: profile?.fullName ?? "[insert full name]",
                original_work_description: "[insert artwork details]",
                original_work_url: "[insert original artwork URL]",
                infringing_urls: ["[insert list of infringing URLs]"],
                address: {
                    street: profile?.street ?? "[insert street name]",
                    aptSuite: profile?.aptSuite ?? undefined,
                    city: profile?.city ?? "[insert city name]",
                    postalCode: profile?.postalCode ?? "[insert postal code]",
                    country: profile?.country ?? "[insert country name]",
                },
                email: profile?.email ?? "[insert your email]",
                phone: profile?.phone ?? "[insert your phone number]",
                signature: profile?.signature ?? "[insert your signature]"
            }
        };

        this.loopThroughObject(payload, necessaryProperties);
        return necessaryProperties;
    }

    private async generatePdf(properties: NecessaryProperties, id: string): Promise<DmcaNoticeFileResponse> {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", buffers.push.bind(buffers));

        doc.font("Helvetica-Bold")
            .fontSize(20)
            .text("DMCA Takedown Notice", {
                align: "center",
                underline: true
            });
        doc.moveDown();

        doc.lineGap(3).fontSize(12)
            .font("Helvetica")
            .text(`Date: ${new Date().toLocaleDateString()}`, {
                align: "center"
            });
        doc.font("Helvetica-Bold")
            .text("Via Email:", {
                underline: true
            });
        doc.font("Helvetica")
            .text(`${properties.platform.name} ${properties.platform.link}`);
        doc.text("c/o Registered DMCA Agent");
        doc.text(properties.platform.email);
        doc.moveDown();

        doc.font("Helvetica-Bold")
            .text("Re: Notice of Copyright Violation (DMCA Takedown Notice) - Request to Remove Offending Content.", {
                align: "center"
            });
        doc.moveDown();

        doc.font("Helvetica")
            .text(`To Registered DMCA Agent for ${properties.platform.name}:`);
        doc.moveDown();

        doc.text(`My name is ${properties.artist.full_name}, and I am the owner or an agent authorized to act on behalf of the owner of an exclusive right that is allegedly infringed. This email is official notification under Section 512(c) of the Digital Millennium Copyright Act ("DMCA") seeking the immediate removal of infringing material.`);
        doc.moveDown();

        doc.list(["Identification of the copyrighted work claimed to have been infringed:"], {
            bulletRadius: 2,
            indent: 15
        });
        doc.moveDown();
        doc.text(properties.artist.original_work_description, {
            indent: 30
        });
        doc.moveDown();

        doc.list(["The original material is located at the following URL(s):"], {
            bulletRadius: 2,
            indent: 15
        });
        doc.moveDown();
        doc.text(properties.artist.original_work_url, {
            indent: 30
        });
        doc.moveDown();

        doc.list(["The infringing material is located at the following URL(s):"], {
            bulletRadius: 2,
            indent: 15
        });
        doc.moveDown();
        doc.list(properties.artist.infringing_urls.slice(1), {
            listType: "numbered",
            indentAllLines: true,
            indent: 30
        });
        doc.moveDown();

        const addressParts = [
            properties.artist.address.street,
            properties.artist.address.aptSuite,
            properties.artist.address.city,
            properties.artist.address.region,
            properties.artist.address.postalCode,
            properties.artist.address.country
        ].filter(part => part);

        doc.text("My contact information is:");
        doc.text(properties.artist.full_name);
        doc.text(addressParts.join(", "));
        doc.text(properties.artist.phone);
        doc.text(properties.artist.email);
        doc.moveDown();

        doc.text("I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.");
        doc.moveDown();
        doc.text("The information in this notification is accurate, and under penalty of perjury, I certify that I am the owner (or am authorized to act on behalf of the owner) of an exclusive right that is allegedly infringed.");
        doc.moveDown();

        doc.text("Thank you,");
        doc.moveDown(2);

        doc.text(`Signature: ${properties.artist.signature}`);
        doc.text(properties.artist.full_name);

        doc.end();

        return new Promise((resolve) => {
            doc.on("end", async () => {
                const buffer = Buffer.concat(buffers);
                const fileKey = `dmca-notices/${id}.pdf`;
                const fileUrl = await this.storage.uploadBuffer(buffer, fileKey, "application/pdf", 1);

                await this.prisma.dmcaNoticeData.update({
                    where: {
                        dmcaNoticeId: id
                    },
                    data: {
                        generated: {
                            increment: 1
                        }
                    }
                });
                resolve({
                    url: fileUrl,
                    filename: `${properties.platform.slug}-notice.pdf`,
                    mimeType: "application/pdf",
                    size: buffer.length
                });
            });
        });
    }

    private async getNoticeEmail(properties: NecessaryProperties): Promise<DmcaNoticeEmailResponse> {
        const subject = `DMCA Takedown Notice - Copyright Infringement - ${properties.artist.full_name}`;
        const body =
            `To the Registered DMCA Agent for ${properties.platform.name},\n\n`
            + `I am writing to provide official notification of copyright infringement. I have attached a formal DMCA Takedown Notice regarding the unauthorized use of my copyrighted work on ${properties.platform.name}.\n\n`
            + `Summary of Infringement:\n\n`
            + ` - Original Work Title/Description:\n\n`
            + `     ${properties.artist.original_work_description}\n\n`
            + ` - Original URL:\n\n`
            + `     ${properties.artist.original_work_url}\n\n`
            + ` - Infringing URL(s):\n\n`
            + `     ${properties.artist.infringing_urls.slice(1).map((url, index) => `${index + 1}. ${url}`)}\n\n`
            + `The attached PDF contains the full formal notification, including the required statements of good faith and the certification under penalty of perjury as required by 17 U.S.C. § 512(c)(3).\n\n`
            + `Please expeditiously remove or disable access to this material to maintain your safe harbor status.\n\n`
            + `Thank you,\n\n`
            + `${properties.artist.full_name}`;

        return {
            to: properties.platform.email,
            subject,
            body
        };
    }

    async generate(userId: string, id: string): Promise<DmcaNoticeGeneratedContent> {
        const notice = await this.prisma.dmcaNotice.findUniqueOrThrow({
            where: {
                id,
                userId
            },
            include: {
                dmcaPlatform: {
                    omit: {
                        formSchema: true
                    }
                },
                user: {
                    select: {
                        dmcaProfile: true
                    }
                }
            }
        });

        if (!notice.payload || typeof notice.payload !== "object" || Array.isArray(notice.payload))
            throw new BadRequestException("Invalid payload");

        const properties = this.getPdfProperties(notice.payload, notice.dmcaPlatform, notice.user?.dmcaProfile);
        const email = await this.getNoticeEmail(properties);
        const pdf = await this.generatePdf(properties, id);

        return {
            email,
            pdf
        };
    }
}
