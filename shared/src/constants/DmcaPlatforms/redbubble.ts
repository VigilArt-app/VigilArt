import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const RedbubbleDmcaFormJSON = {
    slug: "REDBUBBLE",
    displayName: "Redbubble",
    dmcaUrl: "https://help.redbubble.com/hc/en-us/requests/new?ticket_form_id=360000954531",
    domain: "https://www.redbubble.com/",
    websiteCategory: "MARKETPLACES",
    formSchema: []
} as const satisfies DmcaPlatformCreate;
