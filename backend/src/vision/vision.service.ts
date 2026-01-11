import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import {
  VisualSearchResult,
  ArtworkMetadata,
  ArtworkMetadataLabel,
  ArtworkWebEntity,
  MatchingPage,
} from "@vigilart/shared";
import { WebDetection, WebEntity, WebLabel, WebPage } from "./types";
import { classifyWebsite, extractRootDomain, getImageUrl } from "./utils";

@Injectable()
export class VisionService implements OnModuleDestroy {
  private readonly client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  getArtworkReportMetadata(
    bestGuessLabels: WebLabel[] | null | undefined,
    webEntities: WebEntity[] | null | undefined
  ): ArtworkMetadata | null {
    let bestGuessLabelsResult: ArtworkMetadataLabel[] = [];
    let webEntitiesResult: ArtworkWebEntity[] = [];

    if (!bestGuessLabels && !webEntities) {
      return null;
    }
    if (bestGuessLabels) {
      bestGuessLabelsResult = bestGuessLabels.reduce(
        (acc: ArtworkMetadataLabel[], value: WebLabel) => {
          if (value.label) {
            const validItem: ArtworkMetadataLabel = {
              label: value.label,
              languageCode: value.languageCode ?? undefined,
            };
            acc.push(validItem);
          }
          return acc;
        },
        []
      );
    }
    if (webEntities) {
      webEntitiesResult = webEntities.reduce(
        (acc: ArtworkWebEntity[], value: WebEntity) => {
          if (value.score && value.description) {
            const validItem: ArtworkWebEntity = {
              score: value.score,
              description: value.description,
            };
            acc.push(validItem);
          }
          return acc;
        },
        []
      );
    }
    return {
      bestGuessLabels: bestGuessLabelsResult,
      webEntities: webEntitiesResult,
    };
  }

  getArtworkReportMatchingPages(
    pagesWithMatchingImages: WebPage[] | null | undefined
  ): MatchingPage[] {
    if (!pagesWithMatchingImages) {
      return [];
    }
    const matchingPages: MatchingPage[] = pagesWithMatchingImages.reduce(
      (acc: MatchingPage[], page: WebPage) => {
        const hasFullMatches = (page.fullMatchingImages?.length ?? 0) > 0;
        const hasPartialMatches = (page.partialMatchingImages?.length ?? 0) > 0;
        let imageUrl;

        if (hasFullMatches) {
          imageUrl = getImageUrl(page.fullMatchingImages);
        }
        if (hasPartialMatches) {
          imageUrl = getImageUrl(page.partialMatchingImages);
        }
        if (page.url && (hasFullMatches || hasPartialMatches)) {
          const validItem: MatchingPage = {
            url: page.url,
            category: classifyWebsite(page.url),
            websiteName: extractRootDomain(page.url),
            imageUrl: imageUrl ?? undefined,
            pageTitle: page.pageTitle ?? undefined,
          };
          acc.push(validItem);
        }
        return acc;
      },
      []
    );
    return matchingPages;
  }

  async webDetection(
    imageUri: string
  ): Promise<WebDetection | null | undefined> {
    const [result] = await this.client.webDetection(imageUri);
    const webDetection = result.webDetection;

    return webDetection;
  }

  async searchImage(imageUri: string): Promise<VisualSearchResult | null> {
    const webDetection = await this.webDetection(imageUri);

    if (!webDetection || !webDetection.pagesWithMatchingImages) {
      return null;
    }
    const metadata = this.getArtworkReportMetadata(
      webDetection?.bestGuessLabels,
      webDetection?.webEntities
    );
    const matchingPages = this.getArtworkReportMatchingPages(
      webDetection.pagesWithMatchingImages
    );

    return {
      metadata,
      matchingPages,
    };
  }
}
