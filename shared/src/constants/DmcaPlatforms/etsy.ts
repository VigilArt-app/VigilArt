import { DmcaPlatformCreate } from "../../types/Dmca/Platform";
import { genericDmcaFormSchema } from "./generic-form";

export const EtsyDmcaFormJSON = {
    slug: "ETSY",
    displayName: "Etsy",
    dmcaUrl: "https://www.etsy.com/ipreporting",
    email: "legal@etsy.com",
    domain: "https://www.etsy.com/",
    websiteCategory: "MARKETPLACES",
    formSchema: genericDmcaFormSchema
} as const satisfies DmcaPlatformCreate;
