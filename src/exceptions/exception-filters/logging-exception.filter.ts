import { ExceptionFilter } from "./exception-filter.interfaces";
import { ArgumentsHost } from "../../core/interfaces/arguments-host.interface";
import { Catch } from "../../decorators/catch.decorator";
import { HttpException } from "../http-exception";

@Catch(HttpException)
export class LoggingExceptionFilter implements ExceptionFilter {
    catch(
        exception: HttpException,
        host: ArgumentsHost
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        console.error(`${exception.getStatus()} ${exception.getResponse()}`);
        console.log(`요청 경로: ${request.method} ${request.url}`);
        console.log(`요청 헤더: ${JSON.stringify(request.headers)}`);
        console.log(`요청 바디: ${JSON.stringify(request.body)}`);

        /* 처리하지 않고 예외 재발생 */
        throw exception;
    }
}