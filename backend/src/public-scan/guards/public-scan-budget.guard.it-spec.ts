import { ExecutionContext } from "@nestjs/common";
import { PublicScanBudgetGuard } from "./public-scan-budget.guard";
import { PublicScanBudgetService } from "../services/public-scan-budget.service";
import {
  SearchQuotaExhaustedException,
  SerpApiAccountService
} from "../../serpapilens/serpapi-account.service";

describe("PublicScanBudgetGuard", () => {
  let budget: { reserve: jest.Mock };
  let serpApiAccount: { reserveSearches: jest.Mock };
  let releaseSearch: jest.Mock;
  let guard: PublicScanBudgetGuard;
  let request: Record<string, unknown>;

  const context = () =>
    ({
      switchToHttp: () => ({ getRequest: () => request })
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    request = {};
    budget = { reserve: jest.fn().mockResolvedValue("2026-10-22") };
    releaseSearch = jest.fn();
    serpApiAccount = { reserveSearches: jest.fn().mockResolvedValue(releaseSearch) };
    guard = new PublicScanBudgetGuard(
      budget as unknown as PublicScanBudgetService,
      serpApiAccount as unknown as SerpApiAccountService
    );
  });

  it("claims one search and one landing scan", async () => {
    await expect(guard.canActivate(context())).resolves.toBe(true);
    expect(serpApiAccount.reserveSearches).toHaveBeenCalledWith(1);
    expect(request.publicScanReserved).toBe("2026-10-22");
    expect(releaseSearch).not.toHaveBeenCalled();
  });

  // Nothing would hand the scan back: the interceptor only runs once the guard passes.
  it("refuses with 503 without taking a landing scan when the SerpApi quota is used up", async () => {
    serpApiAccount.reserveSearches.mockRejectedValue(new SearchQuotaExhaustedException("2026-11-05"));

    await expect(guard.canActivate(context())).rejects.toMatchObject({ status: 503 });
    expect(budget.reserve).not.toHaveBeenCalled();
  });

  // Otherwise refused visitors pause every scan until the next quota read.
  it("refuses with 429 once the landing budget is spent, and gives the search back", async () => {
    budget.reserve.mockResolvedValue(null);

    await expect(guard.canActivate(context())).rejects.toMatchObject({ status: 429 });
    expect(releaseSearch).toHaveBeenCalledTimes(1);
  });
});
