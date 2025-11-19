import { Injectable } from "@nestjs/common";
import { VisionService } from "src/vision/vision.service";

@Injectable()
export class ArtworksService {
  constructor(private visionService: VisionService) {}

  async webDetectionArtwork(artworkId: string) {
    //retrieve artwork GET /artworks/:id => to mock for unit test
    //call visionService.webDetection(imageUri)
  }
}
