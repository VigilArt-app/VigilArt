import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const OtherDmcaFormJSON = {
    slug: "OTHER",
    displayName: "Other / Custom",
    dmcaUrl: "",
    email: "",
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
} as const satisfies DmcaPlatformCreate;
