import { PrismaClient } from "@vigilart/shared/server";
import { DmcaPlatformGet } from "@vigilart/shared";

const platforms: Array<Omit<DmcaPlatformGet, "id" | "createdAt" | "updatedAt">> = [
    {
        slug: "DEVIANTART",
        displayName: "DeviantArt",
        dmcaUrl: "https://www.deviantart.com/contact-us?menuId=copyright_dmca_holder#issue-response",
        domain: "https://www.deviantart.com/",
        websiteCategory: "ART_PLATFORMS",
        formSchema: [
            {
                kind: "group",
                title: "Content to be removed",
                items: [{
                    kind: "array",
                    key: "infringements",
                    title: "URL of allegedly infringing content",
                    minItems: 1,
                    maxItems: 10,
                    itemSchema: [
                        {
                            kind: "field",
                            key: "stolen_url",
                            type: "url",
                            title: "Infringing Content URL",
                            required: true
                        },
                        {
                            kind: "field",
                            key: "original_work_title",
                            type: "text",
                            title: "Original Work Title",
                            required: true
                        },
                        {
                            kind: "field",
                            key: "original_work_url",
                            type: "url",
                            title: "Original Work URL",
                            required: true
                        }
                    ]
                }]
            },
            {
                kind: "group",
                title: "Your Information",
                items: [
                    {
                        kind: "field",
                        key: "email",
                        type: "email",
                        title: "Your Email",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "full_name",
                        type: "text",
                        title: "Full Name",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "phone_number",
                        type: "text",
                        title: "Phone Number"
                    },
                    {
                        kind: "field",
                        key: "fax",
                        type: "text",
                        title: "Fax"
                    },
                    {
                        kind: "field",
                        key: "street_address",
                        type: "text",
                        title: "Street Address"
                    },
                    {
                        kind: "field",
                        key: "apt",
                        type: "text",
                        title: "Apt or Unit Number"
                    },
                    {
                        kind: "field",
                        key: "city",
                        type: "text",
                        title: "City"
                    },
                    {
                        kind: "field",
                        key: "state_province",
                        type: "text",
                        title: "State/Province"
                    },
                    {
                        kind: "field",
                        key: "postal_code",
                        type: "text",
                        title: "Zip"
                    },
                    {
                        kind: "field",
                        key: "country",
                        type: "text",
                        title: "Country"
                    }
                ]
            },
            {
                kind: "group",
                title: "Legal Information and Signature",
                items: [
                    {
                        kind: "field",
                        key: "signature",
                        type: "text",
                        title: "Signature",
                        description: "Typing your full name in the box below will act as your digital signature."
                    }
                ]
            }
        ]
    },
    {
        slug: "ETSY",
        displayName: "Etsy",
        dmcaUrl: "https://www.etsy.com/ipreporting",
        domain: "https://www.etsy.com/",
        websiteCategory: "MARKETPLACES",
        formSchema: []
    },
    {
        slug: "INSTAGRAM",
        displayName: "Instagram",
        dmcaUrl: "https://www.instagram.com/help/ipreporting/report/copyright/",
        domain: "https://www.instagram.com/",
        websiteCategory: "SOCIAL",
        formSchema: []
    },
    {
        slug: "OTHER",
        displayName: "Other",
        dmcaUrl: "",
        domain: "",
        websiteCategory: "OTHER",
        formSchema: []
    },
    {
        slug: "PINTEREST",
        displayName: "Pinterest",
        dmcaUrl: "https://en.pinterest.com/about/copyright/dmca-pin/",
        domain: "https://en.pinterest.com/",
        websiteCategory: "ART_PLATFORMS",
        formSchema: []
    },
    {
        slug: "REDBUBBLE",
        displayName: "Redbubble",
        dmcaUrl: "https://help.redbubble.com/hc/en-us/requests/new?ticket_form_id=360000954531",
        domain: "https://www.redbubble.com/",
        websiteCategory: "MARKETPLACES",
        formSchema: []
    },
    {
        slug: "TUMBLR",
        displayName: "Tumblr",
        dmcaUrl: "https://www.tumblr.com/dmca",
        domain: "https://www.tumblr.com/",
        websiteCategory: "BLOG",
        formSchema: []
    },
    {
        slug: "X",
        displayName: "X",
        dmcaUrl: "https://help.x.com/en/forms/ipi",
        domain: "https://x.com/",
        websiteCategory: "SOCIAL",
        formSchema: []
    }
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
    console.log("Seeding completed successfully !");
}
