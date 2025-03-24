import { ArgumentsHost } from "../../core/interfaces/arguments-host.interface";
import { ExceptionFilter } from "./exception-filter.interfaces";
import { HttpException } from "../http-exception";

/**
 * 기본 예외 필터
 * - HTTP 예외 기본적인 처리 담당
 */
export class BaseExceptionFilter implements ExceptionFilter {
    catch(
        exception: unknown, 
        host: ArgumentsHost
    ) {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();

        /* exception type guard */
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const message = exception.getResponse();
            
            const error = typeof message === "string"
                ? { message }
                : (message as object);

            /* response 처리 */
        }

        /* 기본 예외 처리 */
        else {
            const status = 500;
            const message = "Internal server error";

            /* response 처리 */
        }
    }

    protected getErrorMessage(exception: unknown): string {
        return exception instanceof Error 
            ? exception.message 
            : String(exception);
    }
}