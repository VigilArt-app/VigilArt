import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MatchingPageGet, VisualSearchResult } from "@vigilart/shared";
import { lastValueFrom } from "rxjs";
import { SerpApiLensMatch } from "./interfaces";
import {
  classifyWebsite,
  extractRootDomain,
  isBlacklisted
} from "../common/utils/website-class";

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
    const { data } = await lastValueFrom(
      this.httpService.get("https://serpapi.com/search", {
        params: {
          engine: "google_lens",
          url: downloadUrl,
          type: "exact_matches",
          api_key: this.apiKey
        },
        timeout: 120000
      })
    );
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
