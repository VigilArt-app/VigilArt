import { Injectable } from "@nestjs/common";
import { ImageAnnotatorClient } from "@google-cloud/vision";

@Injectable()
export class VisionService {
  private readonly client: ImageAnnotatorClient;

  constructor() {
    this.client = new ImageAnnotatorClient();
  }

  async webDetection(imageUri: string) {
    const [result] = await this.client.webDetection(imageUri);
    const webDetection = result.webDetection;
    return webDetection;
  }
}
