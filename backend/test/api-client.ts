import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export class ApiClient {
  private readonly config: ConfigService;
  private readonly base: string;

  constructor(private readonly app: INestApplication) {
    this.config = app.get(ConfigService);
    this.base = this.config.get<string>("API_PREFIX") || "/api/v1";
  }

  get(url: string) {
    return request(this.app.getHttpServer()).get(this.base + url);
  }

  post(url: string) {
    return request(this.app.getHttpServer()).post(this.base + url);
  }

  put(url: string) {
    return request(this.app.getHttpServer()).put(this.base + url);
  }

  patch(url: string) {
    return request(this.app.getHttpServer()).patch(this.base + url);
  }

  delete(url: string) {
    return request(this.app.getHttpServer()).delete(this.base + url);
  }
}
