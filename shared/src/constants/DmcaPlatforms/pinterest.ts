import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const PinterestDmcaFormJSON = {
    slug: "PINTEREST",
    displayName: "Pinterest",
    dmcaUrl: "https://en.pinterest.com/about/copyright/dmca-pin/",
    email: "copyright@pinterest.com",
    domain: "https://en.pinterest.com/",
    websiteCategory: "ART_PLATFORMS",
    formSchema: []
} as const satisfies DmcaPlatformCreate;
