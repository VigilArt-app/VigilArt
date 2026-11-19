// Form groups for platforms without a mapped DMCA form of their own.
// Keys must match what the notice generator and the profile prefill read
// (full_name, street, original_work_url, infringing_url, signature...).

import { DmcaFormItem } from "../../types/Dmca/Platform";

// Keeps literal keys for InferPlatformPayload without `as const` readonly arrays, which DmcaFormSchema rejects.
const defineFormItem = <const T extends DmcaFormItem>(item: T) => item;

export const contactInformationGroup = defineFormItem({
    kind: "group",
    key: "contact_information",
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
            key: "street",
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
            key: "postal_code",
            type: "text",
            title: "Postal code",
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
});

export const infringingContentGroup = defineFormItem({
    kind: "group",
    key: "infringing_content",
    title: "Infringing content",
    items: [
        {
            kind: "field",
            key: "original_work_description",
            type: "textarea",
            title: "Identification of the original work",
            description: "The title and a short description of the artwork that was copied.",
            placeholder: "Title / description of your original work",
            required: true
        },
        {
            kind: "field",
            key: "original_work_url",
            type: "url",
            title: "Link to your original work",
            description: "A URL to your portfolio, social media, or shop proving you created the art.",
            placeholder: "https://my-portfolio.com/art/123",
            required: true
        },
        {
            kind: "array",
            key: "infringements",
            title: "Stolen content links",
            description: "Add all links on this platform that are infringing your rights.",
            minItems: 1,
            maxItems: 10,
            itemSchema: [
                {
                    kind: "field",
                    key: "infringing_url",
                    type: "url",
                    title: "Infringing URL",
                    placeholder: "https://bad-site.com/stolen-image",
                    required: true
                },
                {
                    kind: "field",
                    key: "description",
                    type: "textarea",
                    title: "Specific details",
                    description: "e.g. \"They are selling my art as a print.\"",
                    required: false
                }
            ]
        }
    ]
});

export const legalDeclarationsGroup = defineFormItem({
    kind: "group",
    key: "legal_declarations",
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
});

export const genericDmcaFormSchema: [
    typeof contactInformationGroup,
    typeof infringingContentGroup,
    typeof legalDeclarationsGroup
] = [contactInformationGroup, infringingContentGroup, legalDeclarationsGroup];
