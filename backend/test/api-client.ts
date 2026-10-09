import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TERMS_VERSION, PRIVACY_VERSION } from "@vigilart/shared/constants";

export const signupConsent = {
  acceptedTerms: true,
  termsVersion: TERMS_VERSION,
  privacyVersion: PRIVACY_VERSION,
};

export class ApiClient {
  private readonly config: ConfigService;
  private readonly base: string;
  private readonly agent: ReturnType<typeof request.agent>;

  constructor(private readonly app: INestApplication) {
    this.config = app.get(ConfigService);
    this.base = this.config.getOrThrow<string>("API_PREFIX");
    this.agent = request.agent(this.app.getHttpServer());
  }

  async login(email: string, password: string): Promise<request.Response> {
    return this.agent.post(this.base + "/auth/login").send({ email, password });
  }

  async signup(email: string, password: string, _firstName?: string, _lastName?: string): Promise<request.Response> {
    return this.agent.post(this.base + "/auth/signup").send({ email, password, ...signupConsent });
  }

  async logout(): Promise<request.Response> {
    return this.agent.post(this.base + "/auth/logout");
  }

  get(url: string) {
    return this.agent.get(this.base + url);
  }

  post(url: string) {
    return this.agent.post(this.base + url);
  }

  put(url: string) {
    return this.agent.put(this.base + url);
  }

  patch(url: string) {
    return this.agent.patch(this.base + url);
  }

  delete(url: string) {
    return this.agent.delete(this.base + url);
  }
}
