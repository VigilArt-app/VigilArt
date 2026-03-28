import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MatchingPageGet, VisualSearchResult } from "@vigilart/shared";
import { lastValueFrom } from "rxjs";
import { GoogleLensExactResult } from "./interfaces";
import { classifyWebsite, extractRootDomain } from "../vision/utils";

@Injectable()
export class BrightDataService {
  private readonly apiKey: string;
  private readonly zone: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService
  ) {
    this.apiKey = config.getOrThrow<string>("BRIGHTDATA_API_KEY");
    this.zone = config.getOrThrow<string>("BRIGHTDATA_ZONE");
  }

  async getGoogleLensExactMatches(
    downloadUrl: string
  ): Promise<GoogleLensExactResult[] | null> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`
    };
    const url = encodeURIComponent(downloadUrl);
    const { data } = await lastValueFrom(
      this.httpService.post(
        "https://api.brightdata.com/request",
        {
          zone: this.zone,
          url: `https://lens.google.com/uploadbyurl?url=${url}&brd_lens=exact_matches`,
          format: "raw"
        },
        { headers }
      )
    );
    if (!data || !data.exact_matches) {
      return null;
    }
    const foundMatches: GoogleLensExactResult[] = data.exact_matches;
    return foundMatches;
  }
  // MAKE UNIT TESTS AND PAGINATION
  async searchImage(downloadUrl: string): Promise<VisualSearchResult | null> {
    const metadata = {
      bestGuessLabels: [],
      webEntities: []
    };
    const googleLensExactMatches =
      await this.getGoogleLensExactMatches(downloadUrl);
    if (!googleLensExactMatches) {
      return null;
    }
    const matchingPages: MatchingPageGet[] = googleLensExactMatches.reduce(
      (acc: MatchingPageGet[], match: GoogleLensExactResult) => {
        if (match.link) {
          const validItem: MatchingPageGet = {
            url: match.link,
            category: classifyWebsite(match.link),
            websiteName: extractRootDomain(match.link),
            imageUrl: match.image_url ?? undefined,
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
