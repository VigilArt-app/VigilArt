import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const XDmcaFormJSON = {
    slug: "X",
    displayName: "X",
    dmcaUrl: "https://help.x.com/en/forms/ipi",
    email: "copyright@x.com",
    domain: "https://x.com/",
    websiteCategory: "SOCIAL",
    formSchema: []
} as const satisfies DmcaPlatformCreate;
