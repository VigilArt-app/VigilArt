import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MatchingPageGet, VisualSearchResult } from "@vigilart/shared";
import { isAxiosError } from "axios";
import { lastValueFrom } from "rxjs";
import { SerpApiLensMatch } from "./interfaces";
import {
  classifyWebsite,
  extractRootDomain,
  isBlacklisted
} from "../common/utils/website-class";
import { VisualSearchError } from "../visualsearch/visual-search.error";

// Status codes from https://serpapi.com/api-status-and-error-codes. Only the
// status or code is kept: the axios error holds the API key and signed URL.
const toVisualSearchError = (error: unknown): VisualSearchError => {
  if (!isAxiosError(error)) return new VisualSearchError("provider_error");
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return new VisualSearchError("timeout", error.code);
  }
  const status = error.response?.status;
  const detail = status ? `HTTP ${status}` : error.code;
  if (status === 429) return new VisualSearchError("rate_limit", detail);
  if (status === 400 || status === 401 || status === 403) {
    return new VisualSearchError("invalid_config", detail);
  }
  return new VisualSearchError("provider_error", detail);
};

@Injectable()
export class SerpApiLensService {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService
  ) {
    this.apiKey = config.getOrThrow<string>("SERP_API_GOOGLE_LENS_API_KEY");
  }

  async getExactMatches(
    downloadUrl: string
  ): Promise<SerpApiLensMatch[] | null> {
    const data = await lastValueFrom(
      this.httpService.get("https://serpapi.com/search", {
        params: {
          engine: "google_lens",
          url: downloadUrl,
          type: "exact_matches",
          api_key: this.apiKey
        },
        timeout: 120000
      })
    ).then(
      (response) => response.data,
      (error: unknown) => {
        throw toVisualSearchError(error);
      }
    );
    // "Success" without exact_matches means Google found nothing. "Error" (sent
    // with a 200 too) means the search did not run: never report it as zero matches.
    if (data?.search_metadata?.status === "Error") {
      throw new VisualSearchError("provider_error", data.error);
    }
    if (!data || !data.exact_matches) {
      return null;
    }
    const foundMatches: SerpApiLensMatch[] = data.exact_matches;
    return foundMatches;
  }

  async searchImage(downloadUrl: string): Promise<VisualSearchResult | null> {
    const metadata = {
      bestGuessLabels: [],
      webEntities: []
    };
    const exactMatches = await this.getExactMatches(downloadUrl);
    if (!exactMatches) {
      return null;
    }
    const matchingPages: MatchingPageGet[] = exactMatches.reduce(
      (acc: MatchingPageGet[], match: SerpApiLensMatch) => {
        if (match.link) {
          const validItem: MatchingPageGet = {
            url: match.link,
            category: classifyWebsite(match.link),
            websiteName: extractRootDomain(match.link),
            unsafeDomain: isBlacklisted(match.link),
            imageUrl: match.thumbnail ?? match.image ?? undefined,
            pageTitle: match.title
          };
          acc.push(validItem);
        }
        return acc;
      },
      []
    );
    return {
      metadata,
      matchingPages
    };
  }
}
