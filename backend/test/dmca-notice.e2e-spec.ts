import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import { DeviantArtDmcaFormJSON } from "@vigilart/shared";
import { DeviantArtDmcaPayload } from "@vigilart/shared/types";
import { JwtService } from "@nestjs/jwt";

describe("DMCA Notice E2E", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let jwtService: JwtService;
    let api: ApiClient;
    let token: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        setupApp(app);
        await app.init();
        prismaService = app.get(PrismaService);
        jwtService = app.get(JwtService);
        api = new ApiClient(app);

        const user = await prismaService.user.create({
            data: {
                email: "tester@vigilart.app",
                password: "hashedpassword",
                firstName: "Test",
                lastName: "User",
                dmcaProfile: {
                    create: {
                        fullName: "Test User",
                        addressLine1: "123 Test St",
                        city: "Testville",
                        country: "Testland",
                        email: "tester@vigilart.app",
                        signature: "Test User"
                    }
                }
            },
            include: { dmcaProfile: true }
        });

        token = jwtService.sign({ sub: user.id, email: user.email });
        await prismaService.dmcaPlatform.upsert({
            where: { slug: DeviantArtDmcaFormJSON.slug },
            update: DeviantArtDmcaFormJSON as any,
            create: DeviantArtDmcaFormJSON as any
        });
    });

    afterAll(async () => {
        await prismaService.dmcaNotice.deleteMany();
        await prismaService.dmcaProfile.deleteMany();
        await prismaService.user.deleteMany();
        await app.close();
    });

    describe("DMCA Generation", () => {
        let noticeId: string;

        it("Should create a DMCA notice", async () => {
            const payload: DeviantArtDmcaPayload = {
                infringing_content: {
                    infringements: [
                        {
                            infringing_url: "https://deviantart.com/art/stolen",
                            original_work_title: "My Art",
                            original_work_url: "https://myportfolio.com/art"
                        }
                    ]
                },
                contact_information: {
                    email: "tester@vigilart.app",
                    full_name: "Test User"
                },
                legal_declarations: {
                    signature: "Test User"
                }
            };
            const res = await api
                .post("/dmca/notice")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    dmcaPlatformSlug: "DEVIANTART",
                    payload
                })
                .expect(HttpStatus.CREATED);

            noticeId = res.body.data.id;
            expect(noticeId).toBeDefined();
        });

        it("Should generate PDF Link", async () => {
            const res = await api
                .post(`/dmca/notice/${noticeId}/generate`)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data.url).toBeDefined();
            expect(res.body.data.filename).toContain("DEVIANTART");
            expect(res.body.data.mimeType).toBe("application/pdf");
        });

        it("Should get Email content", async () => {
            const res = await api
                .post(`/dmca/notice/${noticeId}/email`)
                .set("Authorization", `Bearer ${token}`)
                .expect(HttpStatus.OK);

            expect(res.body.data).toBeDefined();

            const { to, subject, body } = res.body.data;

            expect(to).toBe("violations@deviantart.com");
            expect(subject).toContain("DeviantArt");
            expect(body).toContain("Infringing URL");
        });
    });
});
