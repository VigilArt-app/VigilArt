import { getDomain } from "tldts";
import {
  WebsiteCategory,
  type WebsiteCategory as WebsiteCategoryType
} from "@vigilart/shared/enums";

const DOMAIN_PATTERNS: Record<WebsiteCategoryType, RegExp[]> = {
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
    /(?:^|\.)wattpad\.com$/i
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
    /(?:^|\.)zerochan\.net$/i
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
    /(?:^|\.)walmart\.com$/i
  ],
  BLOG: [
    /(?:^|\.)wordpress\.com$/i,
    /(?:^|\.)blogspot\.com$/i,
    /(?:^|\.)medium\.com$/i,
    /(?:^|\.)wixsite\.com$/i,
    /(?:^|\.)wix\.com$/i,
    /(?:^|\.)weebly\.com$/i,
    /(?:^|\.)ghost\.io$/i
  ],
  MEDIA: [
    /(?:^|\.)buzzfeed\.com$/i,
    /(?:^|\.)vice\.com$/i,
    /(?:^|\.)bbc\.co\.uk$/i,
    /(?:^|\.)forbes\.com$/i,
    /(?:^|\.)cnn\.com$/i
  ],
  SEARCH: [
    /(?:^|\.)google\.[a-z]+$/i,
    /(?:^|\.)bing\.com$/i,
    /(?:^|\.)yandex\.com$/i,
    /(?:^|\.)duckduckgo\.com$/i,
    /(?:^|\.)baidu\.com$/i
  ],
  OTHER: []
};

export const classifyWebsite = (rawUrl: string): WebsiteCategoryType => {
  let url = new URL(rawUrl);
  const hostname = url.hostname.toLowerCase();

  for (const [category, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    if (patterns.some((regExp) => regExp.test(hostname))) {
      return category as WebsiteCategoryType;
    }
  }
  return WebsiteCategory.OTHER;
};

export const extractRootDomain = (url: string): string => {
  return getDomain(url) ?? new URL(url).hostname.replace(/^www\./, "");
};

// Collapse host variants that point at the same page: drop a leading `www.` and
// a leading 2-letter country/locale label (e.g. Pinterest's `uk.`/`de.`), so
// `uk.pinterest.com/x` and `www.pinterest.com/x` dedup to one match. Meaningful
// subdomains (`shop.`, `blog.`, per-user hosts like `alice.wixsite.com`) are
// left intact. Only strips when a registrable domain still remains, so hosts
// like `uk.com` or `www.co.uk` are untouched.
const normalizeHost = (hostname: string): string => {
  const labels = hostname.split(".");
  const first = labels[0];
  if (labels.length >= 3 && (first === "www" || /^[a-z]{2}$/.test(first))) {
    const stripped = labels.slice(1).join(".");
    if (getDomain(stripped)) return stripped;
  }
  return hostname;
};

// Two URLs that point at the same page but differ only by query string,
// fragment, or a `www.`/country-code host variant (e.g. `.../status/123?lang=es`
// vs `.../status/123`, or `uk.pinterest.com` vs `www.pinterest.com`) must be
// treated as the same match. Canonicalize so dedup keys on one page URL; leave
// the scheme, path, and trailing slash untouched.
export const normalizeMatchUrl = (rawUrl: string): string => {
  try {
    const url = new URL(rawUrl);
    url.search = "";
    url.hash = "";
    url.hostname = normalizeHost(url.hostname);
    return url.toString();
  } catch {
    return rawUrl; // leave un-parseable URLs untouched
  }
};

export const BLACKLISTED_DOMAINS: string[] = [
  'gelbooru.com',
  'danbooru.donmai.us',
  'rule34.xxx',
  'rule34.paheal.net',
  'e621.net',
  'e926.net',
  'konachan.com',
  'konachan.net',
  'yande.re',
  'sankakucomplex.com',
  'chan.sankakucomplex.com',
  'tbib.org',
  'xbooru.com',
  'safebooru.org',
  'lolibooru.moe',
  'hypnohub.net',
  'nhentai.net',
  'hentai-foundry.com',
  'fantia.jp',
  'joyreactor.cc',
  'reactor.cc',
  'pikabu.ru',
  'buhitter.com',
];

export function isBlacklisted(url: string): boolean {
  const domain = extractRootDomain(url);
  return BLACKLISTED_DOMAINS.some(
    (blocked) => domain === blocked || domain.endsWith(`.${blocked}`),
  );
}

