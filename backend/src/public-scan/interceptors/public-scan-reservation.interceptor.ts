import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Observable, catchError, tap, throwError } from "rxjs";
import { Request } from "express";
import { PublicScanBudgetService } from "../services/public-scan-budget.service";

export interface ReservedRequest extends Request {
  publicScanReserved?: string | null;
  // Gives back the SerpApi search the guard reserved.
  releasePublicScanSearch?: () => void;
}

// Hands the landing budget back whenever a request that claimed a reservation
// ends without a search being paid for. It has to be an interceptor rather than
// a try/catch in the service: the guard reserves before Nest's FileInterceptor
// runs, so an over-sized upload is rejected by multer and the handler is never
// reached. Declared before FileInterceptor so it wraps that rejection too.
@Injectable()
export class PublicScanReservationInterceptor implements NestInterceptor {
  constructor(private readonly budgetService: PublicScanBudgetService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ReservedRequest>();

    return next.handle().pipe(
      // The job is queued: the reservation is now genuinely spent.
      tap(() => {
        request.publicScanReserved = null;
        request.releasePublicScanSearch = undefined;
      }),
      catchError((error) => {
        if (request.publicScanReserved) {
          const reservation = request.publicScanReserved;
          request.publicScanReserved = null;
          void this.budgetService.release(reservation);
        }
        request.releasePublicScanSearch?.();
        request.releasePublicScanSearch = undefined;
        return throwError(() => error);
      })
    );
  }
}
