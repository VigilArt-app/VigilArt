import { DmcaPlatformCreate } from "../../types/Dmca/Platform";
import { genericDmcaFormSchema } from "./generic-form";

export const TumblrDmcaFormJSON = {
    slug: "TUMBLR",
    displayName: "Tumblr",
    dmcaUrl: "https://www.tumblr.com/dmca",
    email: "dmca@tumblr.com",
    domain: "https://www.tumblr.com/",
    websiteCategory: "BLOG",
    formSchema: genericDmcaFormSchema
} as const satisfies DmcaPlatformCreate;
