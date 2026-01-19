import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiSuccessData } from "@vigilart/shared/types";
import { successLabels } from "@vigilart/shared";

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, ApiSuccessData<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccessData<T>> {
        return next.handle().pipe(
            map((data) => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse();
                const statusCode = response.statusCode as ApiSuccessData["statusCode"];

                return {
                    success: true,
                    statusCode: statusCode,
                    data: data ?? {},
                    message: successLabels[statusCode] || "OK",
                } as ApiSuccessData<T>;
            }),
        );
    }
}