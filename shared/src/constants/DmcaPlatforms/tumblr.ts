import { DmcaPlatformCreate } from "../../types/Dmca/Platform";

export const TumblrDmcaFormJSON = {
    slug: "TUMBLR",
    displayName: "Tumblr",
    dmcaUrl: "https://www.tumblr.com/dmca",
    domain: "https://www.tumblr.com/",
    websiteCategory: "BLOG",
    formSchema: []
} as const satisfies DmcaPlatformCreate;
