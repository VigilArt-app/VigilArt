import { Test } from "@nestjs/testing";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import {
  SearchQuotaExhaustedException,
  SerpApiAccountService
} from "./serpapi-account.service";

describe("SerpApiAccountService", () => {
  let service: SerpApiAccountService;
  let httpService: { get: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        SerpApiAccountService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: { getOrThrow: () => "test-key" } }
      ]
    }).compile();
    service = module.get(SerpApiAccountService);
  });

  afterEach(() => jest.restoreAllMocks());

  const mockResponse = (data: unknown) => of({ data } as never);

  // Trimmed from the Account API documentation example.
  const account = {
    plan_name: "Free Plan",
    plan_renewal_date: "2026-11-05",
    searches_per_month: 250,
    plan_searches_left: 37,
    extra_credits: 0,
    total_searches_left: 37
  };

  it("reads the searches left and the renewal date from the Account API", async () => {
    httpService.get.mockReturnValue(mockResponse(account));

    await expect(service.getQuota()).resolves.toEqual({
      searchesLeft: 37,
      renewsOn: "2026-11-05"
    });
    expect(httpService.get).toHaveBeenCalledWith(
      "https://serpapi.com/account.json",
      expect.objectContaining({ params: { api_key: "test-key" } })
    );
  });

  // Landing page visits read the quota too: they must not each call SerpApi.
  it("reuses the quota for a minute, then reads it again", async () => {
    httpService.get.mockReturnValue(mockResponse(account));
    const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);

    await service.getQuota();
    now.mockReturnValue(1_000_000 + 59_000);
    await service.getQuota();
    expect(httpService.get).toHaveBeenCalledTimes(1);

    now.mockReturnValue(1_000_000 + 61_000);
    await service.getQuota();
    expect(httpService.get).toHaveBeenCalledTimes(2);
  });

  // Otherwise every landing visit waits for the 5-second timeout during an outage.
  it("asks SerpApi only once a minute while it is down", async () => {
    httpService.get.mockReturnValue(throwError(() => new Error("connect ETIMEDOUT")));

    await expect(service.getQuota()).resolves.toBeNull();
    await expect(service.getQuota()).resolves.toBeNull();
    expect(httpService.get).toHaveBeenCalledTimes(1);
  });

  it("sends one request for simultaneous first reads", async () => {
    httpService.get.mockReturnValue(mockResponse(account));

    await Promise.all([service.getQuota(), service.getQuota(), service.getQuota()]);
    expect(httpService.get).toHaveBeenCalledTimes(1);
  });

  // The date is formatted on the landing page: an unexpected format must not reach it.
  it("drops a renewal date that is not YYYY-MM-DD", async () => {
    httpService.get.mockReturnValue(mockResponse({ ...account, plan_renewal_date: "Nov 5, 2026" }));

    await expect(service.getQuota()).resolves.toEqual({ searchesLeft: 37, renewsOn: null });
  });

  it("gives back refunded searches to the next scan, only once", async () => {
    httpService.get.mockReturnValue(mockResponse({ ...account, total_searches_left: 3 }));

    const refund = await service.reserveSearches(3);
    await expect(service.reserveSearches(1)).rejects.toBeInstanceOf(SearchQuotaExhaustedException);
    refund();
    refund();
    await service.reserveSearches(3);
    await expect(service.reserveSearches(1)).rejects.toBeInstanceOf(SearchQuotaExhaustedException);
  });

  it("returns null when SerpApi answers without a quota, such as an invalid key", async () => {
    httpService.get.mockReturnValue(mockResponse({ error: "Invalid API key." }));

    await expect(service.getQuota()).resolves.toBeNull();
  });

  it("refuses without a date when the account has no monthly plan", async () => {
    httpService.get.mockReturnValue(
      mockResponse({ ...account, plan_renewal_date: null, total_searches_left: 0 })
    );

    const reservation = service.reserveSearches(1);
    await expect(reservation).rejects.toBeInstanceOf(SearchQuotaExhaustedException);
    await expect(reservation).rejects.toMatchObject({
      message: "Scans are paused: the monthly search quota is reached."
    });
  });

  // Two scans in the same instant must not both take the last searches.
  it("lets only one of two simultaneous reservations take the last searches", async () => {
    httpService.get.mockReturnValue(mockResponse({ ...account, total_searches_left: 3 }));
    await service.getQuota();

    const results = await Promise.allSettled([
      service.reserveSearches(3),
      service.reserveSearches(3)
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([
      "fulfilled",
      "rejected"
    ]);
  });
});
