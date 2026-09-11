import { CallHandler, ExecutionContext } from "@nestjs/common";
import { of, throwError, firstValueFrom } from "rxjs";
import { PublicScanReservationInterceptor } from "./public-scan-reservation.interceptor";
import { PublicScanBudgetService } from "../services/public-scan-budget.service";

describe("PublicScanReservationInterceptor", () => {
  let budget: { release: jest.Mock };
  let interceptor: PublicScanReservationInterceptor;

  const contextFor = (request: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({ getRequest: () => request })
    }) as unknown as ExecutionContext;

  const handlerThat = (behaviour: "succeeds" | "throws") =>
    ({
      handle: () =>
        behaviour === "succeeds"
          ? of({ scanId: "abc" })
          : throwError(() => new Error("upload too large"))
    }) as CallHandler;

  beforeEach(() => {
    budget = { release: jest.fn().mockResolvedValue(undefined) };
    interceptor = new PublicScanReservationInterceptor(
      budget as unknown as PublicScanBudgetService
    );
  });

  it("Should keep the reservation when the scan is queued", async () => {
    const request = { publicScanReserved: true };

    await firstValueFrom(
      interceptor.intercept(contextFor(request), handlerThat("succeeds"))
    );

    expect(budget.release).not.toHaveBeenCalled();
    expect(request.publicScanReserved).toBe(false);
  });

  // The guard reserves before Nest's FileInterceptor runs, so an over-sized
  // upload is rejected by multer and never reaches the handler. Without this,
  // each rejected upload would silently burn one of the day's free scans.
  it("Should give the reservation back when the request fails", async () => {
    const request = { publicScanReserved: true };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), handlerThat("throws"))
      )
    ).rejects.toThrow("upload too large");

    expect(budget.release).toHaveBeenCalledTimes(1);
    expect(request.publicScanReserved).toBe(false);
  });

  it("Should not release for a request that never reserved", async () => {
    const request = { publicScanReserved: false };

    await expect(
      firstValueFrom(
        interceptor.intercept(contextFor(request), handlerThat("throws"))
      )
    ).rejects.toThrow("upload too large");

    expect(budget.release).not.toHaveBeenCalled();
  });
});
