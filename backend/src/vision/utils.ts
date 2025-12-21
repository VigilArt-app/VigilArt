import { WebsiteCategory } from "@vigilart/shared/enums";
import { WebImage } from "./types";

const DOMAIN_PATTERNS: Record<WebsiteCategory, RegExp[]> = {
  SOCIAL: [
    /(?:^|\.)instagram\.com$/i,
    /(?:^|\.)twitter\.com$/i,
    /(?:^|\.)x\.com$/i,
    /(?:^|\.)facebook\.com$/i,
    /(?:^|\.)tiktok\.com$/i,
    /(?:^|\.)reddit\.com$/i,
    /(?:^|\.)tumblr\.com$/i,
    /(?:^|\.)pinterest\.com$/i,
    /(?:^|\.)threads\.net$/i,
    /(?:^|\.)linkedin\.com$/i,
    /(?:^|\.)wattpad\.com$/i,
  ],
  ART_PLATFORMS: [
    /(?:^|\.)deviantart\.com$/i,
    /(?:^|\.)artstation\.com$/i,
    /(?:^|\.)behance\.net$/i,
    /(?:^|\.)pixiv\.net$/i,
    /(?:^|\.)kofi\.com$/i,
    /(?:^|\.)patreon\.com$/i,
    /(?:^|\.)dribbble\.com$/i,
    /(?:^|\.)sketchfab\.com$/i,
    /(?:^|\.)zerochan\.net$/i,
  ],
  MARKETPLACES: [
    /(?:^|\.)etsy\.com$/i,
    /(?:^|\.)redbubble\.com$/i,
    /(?:^|\.)teepublic\.com$/i,
    /(?:^|\.)zazzle\.com$/i,
    /(?:^|\.)teefury\.com$/i,
    /(?:^|\.)shopify\.com$/i,
    /(?:^|\.)amazon\.[a-z]+$/i,
    /(?:^|\.)ebay\.[a-z]+$/i,
    /(?:^|\.)aliexpress\.com$/i,
    /(?:^|\.)walmart\.com$/i,
  ],
  BLOG: [
    /(?:^|\.)wordpress\.com$/i,
    /(?:^|\.)blogspot\.com$/i,
    /(?:^|\.)medium\.com$/i,
    /(?:^|\.)wixsite\.com$/i,
    /(?:^|\.)wix\.com$/i,
    /(?:^|\.)weebly\.com$/i,
    /(?:^|\.)ghost\.io$/i,
  ],
  MEDIA: [
    /(?:^|\.)buzzfeed\.com$/i,
    /(?:^|\.)vice\.com$/i,
    /(?:^|\.)bbc\.co\.uk$/i,
    /(?:^|\.)forbes\.com$/i,
    /(?:^|\.)cnn\.com$/i,
  ],
  SEARCH: [
    /(?:^|\.)google\.[a-z]+$/i,
    /(?:^|\.)bing\.com$/i,
    /(?:^|\.)yandex\.com$/i,
    /(?:^|\.)duckduckgo\.com$/i,
    /(?:^|\.)baidu\.com$/i,
  ],
  OTHER: [],
};

export const classifyWebsite = (rawUrl: string): WebsiteCategory | null => {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch (error: any) {
    throw null;
  }
  const hostname = url.hostname.toLowerCase();

  for (const [category, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    if (patterns.some((regExp) => regExp.test(hostname))) {
      return category as WebsiteCategory;
    }
  }
  return WebsiteCategory.OTHER;
};

export const extractRootDomain = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const parts = hostname.split(".");
    let rootDomain: string;

    if (parts.length <= 2) {
      rootDomain = hostname;
    } else {
      rootDomain = parts.slice(-2).join(".");
    }
    return rootDomain;
  } catch {
    return null;
  }
};

export const getImageUrl = (
  matchingImages: WebImage[] | null | undefined
): string | null => {
  if (!matchingImages || matchingImages.length == 0) {
    return null;
  }
  return matchingImages[0].url ?? null;
};
