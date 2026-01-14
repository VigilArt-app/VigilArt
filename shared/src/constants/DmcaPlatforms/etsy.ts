import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const EtsyDmcaFormJSON = {
    slug: "ETSY",
    displayName: "Etsy",
    dmcaUrl: "https://www.etsy.com/ipreporting",
    domain: "https://www.etsy.com/",
    websiteCategory: "MARKETPLACES",
    formSchema: []
} as const satisfies DmcaPlatformCreate;
