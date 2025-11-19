import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { API_PREFIX } from "../src/app.setup";

export class ApiClient {
  constructor(private readonly app: INestApplication) {}

  private base = API_PREFIX;

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
