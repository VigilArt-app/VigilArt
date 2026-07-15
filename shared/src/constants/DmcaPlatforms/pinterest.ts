import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const PinterestDmcaFormJSON = {
    slug: "PINTEREST",
    displayName: "Pinterest",
    dmcaUrl: "https://pinterest.com/about/copyright/dmca-pin/",
    email: "copyright@pinterest.com",
    domain: "https://pinterest.com/",
    websiteCategory: "ART_PLATFORMS",
    formSchema: [
        {
            kind: "group",
            key: "contact_information",
            title: "Copyright Owner & Contact Information",
            items: [
                {
                    kind: "field",
                    key: "rights_holder",
                    type: "text",
                    title: "Copyright Owner",
                    placeholder: "Name of the copyright owner",
                    required: true
                },
                {
                    kind: "field",
                    key: "full_name",
                    type: "text",
                    title: "Full Legal Name",
                    placeholder: "Your full name",
                    required: true
                },
                {
                    kind: "field",
                    key: "company_name",
                    type: "text",
                    title: "Company Name",
                    placeholder: "Your Company Name",
                    required: false
                },
                {
                    kind: "field",
                    key: "phone_number",
                    type: "text",
                    title: "Contact Number",
                    placeholder: "555-555-5555",
                    required: true
                },
                {
                    kind: "field",
                    key: "email",
                    type: "email",
                    title: "Email Address",
                    placeholder: "your@email.com",
                    required: true
                },
                {
                    kind: "field",
                    key: "street",
                    type: "text",
                    title: "Street Address",
                    placeholder: "123 Main Street",
                    required: true
                },
                {
                    kind: "field",
                    key: "city",
                    type: "text",
                    title: "City",
                    placeholder: "San Francisco",
                    required: true
                },
                {
                    kind: "field",
                    key: "state",
                    type: "text",
                    title: "State",
                    placeholder: "CA",
                    required: true
                },
                {
                    kind: "field",
                    key: "postal_code",
                    type: "text",
                    title: "Zip Code",
                    placeholder: "94110",
                    required: true
                },
                {
                    kind: "field",
                    key: "country",
                    type: "text",
                    title: "Country",
                    placeholder: "France",
                    required: true
                }
            ]
        },
        {
            kind: "group",
            key: "infringing_content",
            title: "Identify Your Work & Infringing Material",
            items: [
                {
                    kind: "field",
                    key: "original_work_url",
                    type: "url",
                    title: "Please tell us where we can see your work on your own website",
                    placeholder: "e.g. http://www.pinterest.com",
                    required: true
                },
                {
                    kind: "field",
                    key: "original_work_description",
                    type: "textarea",
                    title: "Please provide a detailed description of your work and provide as much information as possible",
                    placeholder: "Your work description",
                    required: true
                },
                {
                    kind: "array",
                    key: "infringements",
                    title: "Identify the allegedly infringing material on Pinterest",
                    description: "Please provide full URLs to each individual Pin, Shuffle, or image you would like removed, e.g. https://www.pinterest.com/pin/12345/. Note that you can only submit 100 URLs per request.",
                    minItems: 1,
                    maxItems: 100,
                    itemSchema: [
                        {
                            kind: "field",
                            key: "infringing_url",
                            type: "url",
                            title: "Infringing URL",
                            placeholder: "https://www.pinterest.com/pin/12345/",
                            required: true
                        }
                    ]
                }
            ]
        },
        {
            kind: "group",
            key: "legal_declarations",
            title: "Confirmation & Signature",
            description: "By checking the following boxes, I confirm that:\n- The information in this notice is accurate.\n- I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use).\n- I state under penalty of perjury that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed.",
            items: [
                {
                    kind: "field",
                    key: "signature",
                    type: "text",
                    title: "Electronic Signature",
                    description: "Typing your full legal name in the box below acts as your electronic signature.",
                    placeholder: "Signature",
                    required: true
                }
            ]
        }
    ]
} as const satisfies DmcaPlatformCreate;
