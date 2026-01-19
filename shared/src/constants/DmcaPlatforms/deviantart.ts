import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const DeviantArtDmcaFormJSON = {
    slug: "DEVIANTART",
    displayName: "DeviantArt",
    dmcaUrl: "https://www.deviantart.com/contact-us?menuId=copyright_dmca_holder#issue-response",
    email: "violations@deviantart.com",
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
} as const satisfies DmcaPlatformCreate;
