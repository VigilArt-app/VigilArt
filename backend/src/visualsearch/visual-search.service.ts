import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { MatchingPageGet } from "@vigilart/shared";
import { GoogleLensService } from "../googlelens/googlelens.service";
import { SerpApiLensService } from "../serpapilens/serpapilens.service";

// The reverse-image fan-out, kept apart from ReportsService so a route that
// only needs a search (the public scan) does not have to build the report
// pipeline's database, queue, storage and cache dependencies.
@Injectable()
export class VisualSearchService {
  constructor(
    private readonly googleLensService: GoogleLensService,
    private readonly serpApiLensService: SerpApiLensService
  ) {}

  private readonly logger = new Logger(VisualSearchService.name);

  async aggregate(imageDownloadUrl: string): Promise<MatchingPageGet[]> {
    const settledResults = await Promise.allSettled([
      // BrightData Google Lens disabled: the exact_matches tab regressed
      // server-side (returns the "All" tab, no exact_matches array). Replaced
      // by SerpAPI Google Lens below until BrightData resolves the zone.
      // this.googleLensService.searchImage(imageDownloadUrl)
      this.serpApiLensService.searchImage(imageDownloadUrl)
    ]);
    const providers = ["serpApiLens"] as const;
    const matchingPages: MatchingPageGet[] = [];
    settledResults.forEach((result, index) => {
      if (result.status === "rejected") {
        this.logger.error(
          `Visual search provider "${providers[index]}" failed`,
          result.reason
        );
        return;
      }
      if (result.value) {
        matchingPages.push(...result.value.matchingPages);
      }
    });
    if (settledResults.every((result) => result.status === "rejected")) {
      throw new ServiceUnavailableException(
        "Visual search providers are currently unavailable. Please try again later."
      );
    }
    return matchingPages;
  }
}
