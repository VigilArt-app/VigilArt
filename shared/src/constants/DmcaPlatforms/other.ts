import { DmcaPlatformCreate } from "../../types/Dmca/Platform";
import { contactInformationGroup, infringingContentGroup, legalDeclarationsGroup } from "./generic-form";

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
        contactInformationGroup,
        infringingContentGroup,
        legalDeclarationsGroup
    ]
} as const satisfies DmcaPlatformCreate;
