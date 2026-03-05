import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { setupApp } from "../src/app.setup";
import { ApiClient } from "./api-client";
import {
    DeviantArtDmcaFormJSON,
    DeviantArtDmcaPayload,
    type UserGet
} from "@vigilart/shared";

describe("DMCA User Journey E2E", () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let api: ApiClient;

    let noticeId: string;
    let testUser: { email: string; password: string, id?: string };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        setupApp(app);
        await app.init();
        prismaService = app.get(PrismaService);
        api = new ApiClient(app);
        await prismaService.dmcaPlatform.create({
            data: DeviantArtDmcaFormJSON
        });
    });

    afterAll(async () => {
        await prismaService.dmcaNotice.deleteMany();
        await prismaService.dmcaProfile.deleteMany();
        await prismaService.dmcaPlatform.deleteMany();
        await prismaService.user.deleteMany();
        await app.close();
    });

    describe("Unauthenticated Access Tests", () => {
        it("Should reject profile creation without authentication", async () => {
            await api
                .post(`/dmca/profile`)
                .send({
                    fullName: "John Doe",
                    email: "john.doe@vigilart.app",
                    address: "123 Main St",
                    city: "New York",
                    state: "NY",
                    zipCode: "10001",
                    country: "USA"
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it("Should reject notice creation without authentication", async () => {
            await api
                .post("/dmca/notice")
                .send({
                    dmcaPlatformSlug: "DEVIANTART",
                    payload: {}
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it("Should reject update without authentication", async () => {
            await api
                .patch(`/dmca/notice/00000000-0000-0000-0000-000000000000`)
                .send({
                    payload: {}
                })
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it("Should reject PDF generation without authentication", async () => {
            await api
                .post(`/dmca/notice/00000000-0000-0000-0000-000000000000/generate`)
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });

    describe("Authenticated User Journey", () => {
        beforeAll(async () => {
            testUser = {
                email: "test.auth@mail.com",
                password: "Secure_P4ssword"
            };
            await api.signup(
                testUser.email,
                testUser.password,
                "Test",
                "User"
            );
        });

        afterAll(async () => {
            await prismaService.user.deleteMany();
        });

        beforeEach(async () => {
            const user: UserGet = (await api.login(testUser.email, testUser.password)).body.data;
            testUser.id = user.id;
        });

        afterEach(async () => {
            testUser.id = undefined;
            await api.logout();
        });

        describe("1. DMCA Profile Management", () => {

        it("Should reject profile creation with missing required fields", async () => {
            await api
                .post(`/dmca/profile`)
                .send({
                    fullName: "John Doe",
                    email: "john.doe@vigilart.app"
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it("Should successfully create a DMCA profile", async () => {
            const res = await api
                .post(`/dmca/profile`)
                .send({
                    fullName: "John Doe",
                    email: "john.doe@vigilart.app",
                    street: "123 Main St",
                    aptSuite: null,
                    city: "New York",
                    postalCode: "10001",
                    country: "USA",
                    phone: "+1234567890",
                    signature: "John Doe"
                })
                .expect(HttpStatus.CREATED);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: expect.any(String),
                userId: testUser.id,
                fullName: "John Doe",
                email: "john.doe@vigilart.app",
                street: "123 Main St",
                city: "New York",
                postalCode: "10001",
                country: "USA",
                phone: "+1234567890",
                signature: "John Doe",
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
        });

        it("Should reject duplicate profile creation", async () => {
            await api
                .post(`/dmca/profile`)
                .send({
                    fullName: "John Doe",
                    email: "john.doe@vigilart.app",
                    street: "123 Main St",
                    aptSuite: null,
                    city: "New York",
                    postalCode: "10001",
                    country: "USA",
                    phone: "+1234567890",
                    signature: "John Doe"
                }).expect(HttpStatus.CONFLICT);
        });

        it("Should successfully retrieve the DMCA profile", async () => {
            const res = await api
                .get(`/dmca/profile`)
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: expect.any(String),
                userId: testUser.id,
                fullName: "John Doe",
                email: "john.doe@vigilart.app",
                street: "123 Main St",
                city: "New York",
                postalCode: "10001",
                country: "USA",
                phone: "+1234567890",
                signature: "John Doe",
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
        });

        it("Should successfully update the DMCA profile", async () => {
            const res = await api
                .patch(`/dmca/profile`)
                .send({
                    phone: "+9876543210",
                    street: "456 Oak Avenue"
                })
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: expect.any(String),
                userId: testUser.id,
                fullName: "John Doe",
                email: "john.doe@vigilart.app",
                street: "456 Oak Avenue",
                city: "New York",
                postalCode: "10001",
                country: "USA",
                phone: "+9876543210",
                signature: "John Doe",
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
        });
    });

    describe("2. DMCA Notice Creation", () => {
        it("Should reject notice with invalid platform", async () => {
            await api
                .post("/dmca/notice")
                .send({
                    dmcaPlatformSlug: "INVALID_PLATFORM",
                    payload: {}
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it("Should reject notice with missing required payload fields", async () => {
            const incompletePayload: Partial<DeviantArtDmcaPayload> = {
                contact_information: {
                    email: "john.doe@vigilart.app",
                    full_name: "John Doe"
                }
            };

            await api
                .post("/dmca/notice")
                .send({
                    dmcaPlatformSlug: "DEVIANTART",
                    payload: incompletePayload
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it("Should reject notice with invalid URL format", async () => {
            const invalidPayload: DeviantArtDmcaPayload = {
                infringing_content: {
                    infringements: [
                        {
                            infringing_url: "not-a-valid-url"
                        }
                    ],
                    original_work_description: "My Art",
                    original_work_url: "https://myportfolio.com/art"
                },
                contact_information: {
                    email: "john.doe@vigilart.app",
                    full_name: "John Doe"
                },
                legal_declarations: {
                    signature: "John Doe"
                }
            };

            await api
                .post("/dmca/notice")
                .send({
                    dmcaPlatformSlug: "DEVIANTART",
                    payload: invalidPayload
                })
                .expect(HttpStatus.BAD_REQUEST);
        });

        it("Should successfully create a DMCA notice", async () => {
            const validPayload: DeviantArtDmcaPayload = {
                infringing_content: {
                    infringements: [
                        {
                            infringing_url: "https://deviantart.com/art/stolen-artwork-123456"
                        },
                        {
                            infringing_url: "https://deviantart.com/art/another-stolen-789012"
                        }
                    ],
                    original_work_description: "My original digital artwork titled 'Sunset Dreams'",
                    original_work_url: "https://myportfolio.com/artwork/sunset-dreams"
                },
                contact_information: {
                    email: "john.doe@vigilart.app",
                    full_name: "John Doe"
                },
                legal_declarations: {
                    signature: "John Doe"
                }
            };

            const res = await api
                .post("/dmca/notice")
                .send({
                    dmcaPlatformSlug: "DEVIANTART",
                    payload: validPayload,
                    userId: testUser.id,
                    artworkId: null
                }).expect(HttpStatus.CREATED);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: expect.any(String),
                userId: testUser.id,
                dmcaPlatformSlug: "DEVIANTART",
                status: expect.any(String),
                payload: expect.any(Object),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
            noticeId = res.body.data.id;
        });

        it("Should successfully retrieve the created notice", async () => {
            const res = await api
                .get(`/dmca/notice/${noticeId}`)
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: noticeId,
                userId: testUser.id,
                dmcaPlatformSlug: "DEVIANTART",
                status: expect.any(String),
                payload: expect.any(Object),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
        });

        it("Should successfully retrieve all notices for user", async () => {
            const res = await api
                .get(`/dmca/notice/user`)
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: noticeId,
                        userId: testUser.id,
                        dmcaPlatformSlug: "DEVIANTART",
                        status: expect.any(String),
                        payload: expect.any(Object)
                    })
                ])
            );
        });
    });

    describe("3. DMCA Notice Updates", () => {
        it("Should reject update with non-existent notice ID", async () => {
            await api
                .patch(`/dmca/notice/00000000-0000-0000-0000-000000000000`)
                .send({
                    payload: {}
                })
                .expect(HttpStatus.NOT_FOUND);
        });

        it("Should successfully update the notice payload", async () => {
            const updatedPayload: DeviantArtDmcaPayload = {
                infringing_content: {
                    infringements: [
                        {
                            infringing_url: "https://deviantart.com/art/stolen-artwork-123456"
                        },
                        {
                            infringing_url: "https://deviantart.com/art/another-stolen-789012"
                        },
                        {
                            infringing_url: "https://deviantart.com/art/third-infringement-345678"
                        }
                    ],
                    original_work_description: "My original digital artwork titled 'Sunset Dreams' - Updated description with more details",
                    original_work_url: "https://myportfolio.com/artwork/sunset-dreams"
                },
                contact_information: {
                    email: "john.doe@vigilart.app",
                    full_name: "John Doe"
                },
                legal_declarations: {
                    signature: "John Doe"
                }
            };

            const res = await api
                .patch(`/dmca/notice/${noticeId}`)
                .send({
                    payload: updatedPayload
                })
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: noticeId,
                userId: testUser.id,
                dmcaPlatformSlug: "DEVIANTART",
                status: expect.any(String),
                payload: {
                    infringing_content: {
                        infringements: expect.arrayContaining([
                            expect.objectContaining({ infringing_url: expect.any(String) }),
                            expect.objectContaining({ infringing_url: expect.any(String) }),
                            expect.objectContaining({ infringing_url: expect.any(String) })
                        ]),
                        original_work_description: expect.any(String),
                        original_work_url: expect.any(String)
                    },
                    contact_information: expect.any(Object),
                    legal_declarations: expect.any(Object)
                },
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
            expect(res.body.data.payload.infringing_content.infringements).toHaveLength(3);
        });

        it("Should successfully update notice status", async () => {
            const res = await api
                .patch(`/dmca/notice/${noticeId}/status/SUBMITTED`)
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                id: noticeId,
                userId: testUser.id,
                dmcaPlatformSlug: "DEVIANTART",
                status: "SUBMITTED",
                payload: expect.any(Object),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
        });
    });

    describe("4. DMCA Notice Generation", () => {
        it("Should reject generation for non-existent notice", async () => {
            await api
                .post(`/dmca/notice/00000000-0000-0000-0000-000000000000/generate`)
                .expect(HttpStatus.NOT_FOUND);
        });

        it("Should successfully generate PDF and email content", async () => {
            const res = await api
                .post(`/dmca/notice/${noticeId}/generate`)
                .expect(HttpStatus.OK);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                email: {
                    to: expect.any(String),
                    subject: expect.any(String),
                    body: expect.any(String)
                },
                pdf: {
                    url: expect.any(String),
                    filename: expect.any(String),
                    mimeType: "application/pdf",
                    size: expect.any(Number)
                }
            });
        });

        it("Should verify generated content contains correct information", async () => {
            const res = await api
                .post(`/dmca/notice/${noticeId}/generate`)
                .expect(HttpStatus.OK);

            expect(res.body.data).toMatchObject({
                email: {
                    to: expect.any(String),
                    subject: expect.any(String),
                    body: expect.any(String)
                },
                pdf: {
                    url: expect.any(String),
                    filename: expect.any(String),
                    mimeType: "application/pdf",
                    size: expect.any(Number)
                }
            });
        });
    });

        describe("5. Cleanup and Deletion", () => {
            it("Should successfully delete the DMCA profile", async () => {
                await api
                    .delete(`/dmca/profile`)
                    .expect(HttpStatus.NO_CONTENT);
            });

            it("Should verify profile was deleted", async () => {
                await api
                    .get(`/dmca/profile`)
                    .expect(HttpStatus.NOT_FOUND);
            });
        });
    });
});
