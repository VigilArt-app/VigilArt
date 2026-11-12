import { DmcaPlatformCreate } from "../../types/Dmca/Platform";
import { genericDmcaFormSchema } from "./generic-form";

export const RedbubbleDmcaFormJSON = {
    slug: "REDBUBBLE",
    displayName: "Redbubble",
    dmcaUrl: "https://help.redbubble.com/hc/en-us/requests/new?ticket_form_id=360000954531",
    email: "dmca@redbubble.com",
    domain: "https://www.redbubble.com/",
    websiteCategory: "MARKETPLACES",
    formSchema: genericDmcaFormSchema
} as const satisfies DmcaPlatformCreate;
