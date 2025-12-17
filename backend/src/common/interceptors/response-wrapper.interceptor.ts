import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponseData } from "@vigilart/shared/types";

@Injectable()
export class ResponseWrapperInterceptor<T> implements NestInterceptor<T, ApiResponseData<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponseData<T>> {
        return next.handle().pipe(
            map((data) => {
                const ctx = context.switchToHttp();
                const response = ctx.getResponse();
                const statusCode = response.statusCode;

                if (statusCode === 204) {
                    return {
                        success: true,
                        statusCode: 204,
                        message: "Data deleted successfully."
                    } satisfies ApiResponseData<T>;
                }
                if (statusCode === 201) {
                    return {
                        success: true,
                        statusCode: 201,
                        data: data ?? null,
                        message: "Data created successfully."
                    } satisfies ApiResponseData<T>;
                }
                return {
                    success: true,
                    statusCode: 200,
                    data: data ?? null,
                    message: "Request successful."
                } satisfies ApiResponseData<T>;
            }),
        );
    }
}