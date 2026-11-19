import { DmcaPlatformCreate } from "../../types/Dmca/Platform";
import { genericDmcaFormSchema } from "./generic-form";

export const XDmcaFormJSON = {
    slug: "X",
    displayName: "X",
    dmcaUrl: "https://help.x.com/en/forms/ipi",
    email: "copyright@x.com",
    domain: "https://x.com/",
    websiteCategory: "SOCIAL",
    formSchema: genericDmcaFormSchema
} as const satisfies DmcaPlatformCreate;
