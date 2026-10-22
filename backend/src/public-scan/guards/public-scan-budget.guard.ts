import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { PublicScanBudgetService } from "../services/public-scan-budget.service";
import { SerpApiAccountService } from "../../serpapilens/serpapi-account.service";
import type { ReservedRequest } from "../interceptors/public-scan-reservation.interceptor";

// Claims one scan from the landing budget before the request is allowed through.
// Runs after the bot check and the per-visitor limit, so a rejected request
// never consumes budget. If the request then fails before a search is paid for,
// PublicScanReservationInterceptor hands the reservation back.
@Injectable()
export class PublicScanBudgetGuard implements CanActivate {
  constructor(
    private readonly budgetService: PublicScanBudgetService,
    private readonly serpApiAccount: SerpApiAccountService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Checked first: a refusal here must not take a scan from the landing budget.
    const releaseSearch = await this.serpApiAccount.reserveSearches(1);
    const reserved = await this.budgetService.reserve();
    if (!reserved) {
      releaseSearch();
      throw new HttpException(
        "Free scans are used up for now. Create an account to keep scanning.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    // Marks the request as holding a reservation, so the interceptor knows
    // whether there is anything to release when it aborts.
    const request = context.switchToHttp().getRequest<ReservedRequest>();
    request.publicScanReserved = reserved;
    request.releasePublicScanSearch = releaseSearch;
    return true;
  }
}
