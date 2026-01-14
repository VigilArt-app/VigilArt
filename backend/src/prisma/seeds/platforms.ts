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
                key: "infringing_content",
                title: "Content to be removed",
                items: [
                    {
                        kind: "array",
                        key: "infringements",
                        title: "URL of allegedly infringing content",
                        minItems: 1,
                        maxItems: 10,
                        itemSchema: [
                            {
                                kind: "field",
                                key: "infringing_url",
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
                    }
                ]
            },
            {
                kind: "group",
                key: "your_information",
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
                key: "legal_information",
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
        formSchema: [
            {
                kind: "group",
                key: "your_information",
                title: "Your contact information",
                items: [
                    {
                        kind: "field",
                        key: "full_name",
                        type: "text",
                        title: "Full Name",
                        placeholder: "Your full name",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "rights_holder",
                        type: "text",
                        title: "Name of the rights holder",
                        placeholder: "Name of the rights holder",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "country",
                        type: "text",
                        title: "Where are you asserting your rights ?",
                        placeholder: "Where are you asserting your rights ?",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "report_kind",
                        type: "text",
                        title: "Which of these best describes the copyrighted work?",
                        description: "Possible inputs are: Photo, Video, Text and Other",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "original_work_url",
                        type: "url",
                        title: "Provide a link to the copyrighted work.",
                        description: "You can provide one link (URL) to examples on your website, your Facebook Page or anywhere else on the web. Each individual report submitted must pertain to only one type of copyrighted work, which should be clearly identified here. Please note that we are unable to review materials hosted on a third-party application.",
                        placeholder: "Provide a link to the copyrighted work.",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "work_description",
                        type: "textarea",
                        title: "Describe your copyrighted work in the link you provided above.",
                        placeholder: "Describe your copyrighted work in the link you provided above.",
                        required: true
                    }
                ]
            },
            {
                kind: "group",
                key: "infringing_content",
                title: "Content you want to report",
                items: [
                    {
                        kind: "field",
                        key: "report_kind",
                        type: "text",
                        title: "What type of content are you reporting?",
                        description: "Possible inputs are: Photo/Video/Post, Story, Ad and Other",
                        placeholder: "What type of content are you reporting?",
                        required: true
                    },
                    {
                        kind: "array",
                        key: "infringements",
                        title: "Please provide links (URLs) leading directly to the specific content you are reporting.",
                        description: "You can report multiple links (URLs) in this report. To do this, enter links (URLs) in the box below. Enter one link per line.",
                        minItems: 1,
                        maxItems: 50,
                        itemSchema: [
                            {
                                kind: "field",
                                key: "infringing_url",
                                type: "url",
                                title: "Link",
                                placeholder: "https://www.instagram.com/...",
                                required: true
                            }
                        ]
                    },
                    {
                        kind: "field",
                        key: "content_infrigement_description",
                        type: "textarea",
                        title: "Describe how you believe this content infringes your intellectual property rights, and provide any additional information that can help us understand your report.",
                        placeholder: "Describe how you believe this content infringes your intellectual property rights, and provide any additional information that can help us understand your report.",
                        required: true
                    }
                ]
            },
            {
                kind: "group",
                key: "declaration_statement",
                title: "Declaration Statement",
                description: "By submitting this notice, you state that you have a good faith belief that the reported use described above, in the manner you have complained of, is not authorized by the intellectual property rights owner, its agent, or the law; that the information contained in this notice is accurate; and, under penalty of perjury, that you are authorized to act on behalf of the owner of the intellectual property rights at issue.",
                items: [
                    {
                        kind: "field",
                        key: "signature",
                        type: "text",
                        title: "Electronic signature",
                        description: "Your electronic signature should match your full name.",
                        placeholder: "Electronic signature",
                        required: true
                    }
                ]
            }
        ]
    },
    {
        slug: "OTHER",
        displayName: "Other / Custom",
        dmcaUrl: "",
        domain: "",
        websiteCategory: "OTHER",
        formSchema: [
            {
                kind: 'group',
                key: "platform_information",
                title: 'Platform information',
                description: 'Enter the details of the website where you found the stolen content.',
                items: [
                    {
                        kind: 'field',
                        key: 'platform_name',
                        type: 'text',
                        title: 'Platform name',
                        description: 'Used to address the email (e.g. "Dear [Name] Team").',
                        placeholder: 'e.g. SuperArtSite',
                        required: true
                    },
                    {
                        kind: 'field',
                        key: 'dmca_contact',
                        type: 'text',
                        title: 'DMCA contact (email or URL)',
                        description: 'Where should we send this notice? Search for "Copyright" or "Terms" on their site.',
                        placeholder: 'copyright@example.com',
                        required: true
                    }
                ]
            },
            {
                kind: "group",
                key: "your_information",
                title: "Your contact information",
                description: "This information will be included in the legal notice sent to the platform.",
                items: [
                    {
                        kind: "field",
                        key: "full_name",
                        type: "text",
                        title: "Full legal name",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "email",
                        type: "email",
                        title: "Your email address",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "street_address",
                        type: "text",
                        title: "Street address",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "city",
                        type: "text",
                        title: "City",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "country",
                        type: "text",
                        title: "Country",
                        required: true
                    },
                    {
                        kind: "field",
                        key: "phone_number",
                        type: "text",
                        title: "Phone number",
                        required: true
                    }
                ]
            },
            {
                kind: 'group',
                key: "infringing_content",
                title: 'Infringing content',
                items: [
                    {
                        kind: 'field',
                        key: 'original_work_url',
                        type: 'url',
                        title: 'Link to your original work',
                        description: 'A URL to your portfolio, social media, or shop proving you created the art.',
                        placeholder: 'https://my-portfolio.com/art/123',
                        required: true
                    },
                    {
                        kind: 'array',
                        key: 'infringements',
                        title: 'Stolen content links',
                        description: 'Add all links on this platform that are infringing your rights.',
                        minItems: 1,
                        maxItems: 10,
                        itemSchema: [
                            {
                                kind: 'group',
                                key: 'infringing_item',
                                title: 'Infringing item',
                                items: [
                                    {
                                        kind: 'field',
                                        key: 'url',
                                        type: 'url',
                                        title: 'Infringing URL',
                                        placeholder: 'https://bad-site.com/stolen-image',
                                        required: true
                                    },
                                    {
                                        kind: 'field',
                                        key: 'description',
                                        type: 'textarea',
                                        title: 'Specific details',
                                        description: 'e.g. "They are selling my art as a print."',
                                        required: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                kind: "group",
                key: "declaration_statement",
                title: "Declaration & signature",
                description: "By signing, you affirm that the information in this notice is accurate and that you have a good faith belief that the use of the material is not authorized.",
                items: [
                    {
                        kind: "field",
                        key: "signature",
                        type: "text",
                        title: "Electronic signature",
                        description: "Type your full legal name to act as a digital signature.",
                        placeholder: "John Doe",
                        required: true
                    }
                ]
            }
        ]
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
