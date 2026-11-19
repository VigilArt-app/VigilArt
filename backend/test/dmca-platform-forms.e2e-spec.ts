import { Test } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { StorageService } from "../src/storage/storage.service";
import { setupApp } from "../src/app.setup";
import { seedPlatforms } from "../src/prisma/seeds/platforms";
import { ApiClient } from "./api-client";
import PDFDocument from "pdfkit";
import type { EtsyDmcaPayload, UserGet } from "@vigilart/shared";

// Platforms that shipped with an empty form and produced notices full of "[insert ...]" placeholders.
const PREVIOUSLY_EMPTY_SLUGS = ["ETSY", "REDBUBBLE", "TUMBLR", "X"];

const completePayload: EtsyDmcaPayload = {
    contact_information: {
        full_name: "Ayaka Suda",
        email: "ayaka.suda@example.com",
        street: "12 rue des Lilas",
        city: "Lyon",
        postal_code: "69003",
        country: "France",
        phone_number: "+33 6 12 34 56 78"
    },
    infringing_content: {
        original_work_description: "Koi Pond at Dusk, digital painting, 2025",
        original_work_url: "https://ayaka-art.example.com/koi-pond",
        infringements: [
            { infringing_url: "https://shop.example.com/listing/koi-pond-print" }
        ]
    },
    legal_declarations: {
        signature: "Ayaka Suda"
    }
};

describe("DMCA platform forms E2E", () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let api: ApiClient;
    let userId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
            .overrideProvider(StorageService)
            .useValue({ uploadBuffer: async (_: Buffer, key: string) => `https://storage.invalid/${key}` })
            .compile();

        app = moduleRef.createNestApplication();
        setupApp(app);
        await app.init();
        prisma = app.get(PrismaService);
        api = new ApiClient(app);

        // Same code path as the deploy seeder, so this checks what reaches dev/prod databases.
        await seedPlatforms(prisma);

        const credentials = { email: "platform.forms@mail.com", password: "Secure_P4ssword" };
        await api.signup(credentials.email, credentials.password);
        userId = ((await api.login(credentials.email, credentials.password)).body.data as UserGet).id;
    });

    afterAll(async () => {
        await prisma.dmcaNotice.deleteMany();
        await prisma.dmcaPlatform.deleteMany();
        await prisma.user.deleteMany();
        await app.close();
    });

    it("Every seeded platform exposes a form asking for the original work, its URL, infringing URLs and a signature", async () => {
        const res = await api.get("/dmca/platform").expect(HttpStatus.OK);
        const platforms = res.body.data as Array<{ slug: string, formSchema: unknown[] }>;

        expect(platforms.map(p => p.slug)).toEqual(expect.arrayContaining([...PREVIOUSLY_EMPTY_SLUGS, "OTHER"]));
        for (const platform of platforms) {
            const schema = JSON.stringify(platform.formSchema);
            for (const key of ["original_work_description", "original_work_url", "infringing_url", "signature"])
                expect({ slug: platform.slug, hasKey: schema.includes(`"key":"${key}"`) }).toEqual({ slug: platform.slug, hasKey: true });
        }
    });

    it.each(PREVIOUSLY_EMPTY_SLUGS)("%s rejects a notice with an empty payload", async (slug) => {
        await api
            .post("/dmca/notice")
            .send({ dmcaPlatformSlug: slug, payload: {}, userId, artworkId: null })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it.each(PREVIOUSLY_EMPTY_SLUGS)("%s generates a notice with the artist's details and no placeholder", async (slug) => {
        const created = await api
            .post("/dmca/notice")
            .send({ dmcaPlatformSlug: slug, payload: completePayload, userId, artworkId: null })
            .expect(HttpStatus.CREATED);

        const res = await api
            .post(`/dmca/notice/${created.body.data.id}/generate`)
            .expect(HttpStatus.OK);

        const { body } = res.body.data.email;
        expect(body).toContain("Koi Pond at Dusk, digital painting, 2025");
        expect(body).toContain("https://ayaka-art.example.com/koi-pond");
        expect(body).toContain("https://shop.example.com/listing/koi-pond-print");
        expect(body).not.toContain("[insert");
    });

    it("Writes the postal code and country typed in the form into the PDF when the user has no DMCA profile", async () => {
        // PDFKit compresses its output, so the text is read where it is written.
        const pdfText = jest.spyOn(PDFDocument.prototype, "text");
        const created = await api
            .post("/dmca/notice")
            .send({ dmcaPlatformSlug: "TUMBLR", payload: completePayload, userId, artworkId: null })
            .expect(HttpStatus.CREATED);

        await api.post(`/dmca/notice/${created.body.data.id}/generate`).expect(HttpStatus.OK);

        const written = pdfText.mock.calls.map(([text]) => String(text)).join("\n");
        pdfText.mockRestore();
        expect(written).toContain("12 rue des Lilas, Lyon, 69003, France");
        expect(written).not.toContain("[insert");
    });

    it("Refuses to create a notice for a platform whose form is empty", async () => {
        await prisma.dmcaPlatform.create({
            data: {
                slug: "EMPTY_FORM",
                displayName: "Empty form",
                dmcaUrl: "",
                email: "dmca@empty.example.com",
                domain: "https://empty.example.com/",
                websiteCategory: "OTHER",
                formSchema: []
            }
        });

        await api
            .post("/dmca/notice")
            .send({ dmcaPlatformSlug: "EMPTY_FORM", payload: completePayload, userId, artworkId: null })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it("Refuses to generate a draft saved without any infringing URL", async () => {
        // Drafts created before the fix were stored with an empty payload.
        const draft = await prisma.dmcaNotice.create({
            data: { userId, dmcaPlatformSlug: "ETSY", payload: {}, dmcaNoticeData: { create: {} } }
        });

        await api
            .post(`/dmca/notice/${draft.id}/generate`)
            .expect(HttpStatus.BAD_REQUEST);
    });
});
