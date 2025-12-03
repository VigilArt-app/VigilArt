import { Injectable } from "@nestjs/common";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import {
  IVisualSearchResult,
  IArtworkMetadata,
  IArtworkMetadataLabel,
  IArtworkWebEntity,
  IMatchingPage,
} from "src/reports/interfaces";
import { WebEntity, WebLabel, WebPage } from "./types";
import { classifyWebsite, extractRootDomain, getImageUrl } from "./utils";

@Injectable()
export class VisionService {
  private readonly client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  getArtworkReportMetadata(
    bestGuessLabels: WebLabel[] | null | undefined,
    webEntities: WebEntity[] | null | undefined
  ): IArtworkMetadata | null {
    let bestGuessLabelsResult: IArtworkMetadataLabel[] = [];
    let webEntitiesResult: IArtworkWebEntity[] = [];

    if (!bestGuessLabels && !webEntities) {
      return null;
    }
    if (bestGuessLabels) {
      bestGuessLabelsResult = bestGuessLabels.reduce(
        (acc: IArtworkMetadataLabel[], value: WebLabel) => {
          if (value.label) {
            const validItem: IArtworkMetadataLabel = {
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
        (acc: IArtworkWebEntity[], value: WebEntity) => {
          if (value.score && value.description) {
            const validItem: IArtworkWebEntity = {
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
  ): IMatchingPage[] {
    if (!pagesWithMatchingImages) {
      return [];
    }
    const matchingPages: IMatchingPage[] = pagesWithMatchingImages.reduce(
      (acc: IMatchingPage[], page: WebPage) => {
        const hasFullMatches = (page.fullMatchingImages?.length ?? 0) > 0;
        const hasPartialMatches = (page.partialMatchingImages?.length ?? 0) > 0;
        let imageUrl;

        if (hasFullMatches) {
          imageUrl = getImageUrl(page.fullMatchingImages);
        }
        if (hasPartialMatches) {
          imageUrl = getImageUrl(page.fullMatchingImages);
        }
        if (page.url && (hasFullMatches || hasPartialMatches)) {
          const validItem: IMatchingPage = {
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

  async webDetection(imageUri: string) {
    const [result] = await this.client.webDetection(imageUri);
    const webDetection = result.webDetection;

    return webDetection;
  }

  async searchImage(imageUri: string): Promise<IVisualSearchResult | null> {
    try {
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
    } catch (e: any) {
      throw e;
    }
  }
}
