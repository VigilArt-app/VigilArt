import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { PublicScanBudgetService } from "./public-scan-budget.service";
import type { ReservedRequest } from "./public-scan-reservation.interceptor";

// Claims one scan from the day's budget before the request is allowed through.
// Runs after the bot check and the per-visitor limit, so a rejected request
// never consumes budget. If the request then fails before a search is paid for,
// PublicScanReservationInterceptor hands the reservation back.
@Injectable()
export class PublicScanBudgetGuard implements CanActivate {
  constructor(private readonly budgetService: PublicScanBudgetService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const reserved = await this.budgetService.reserve();
    if (!reserved) {
      throw new HttpException(
        "Today's free scans are all used up. Create an account to keep scanning.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    // Marks the request as holding a reservation, so the interceptor knows
    // whether there is anything to release when it aborts.
    context.switchToHttp().getRequest<ReservedRequest>().publicScanReserved =
      true;
    return true;
  }
}
