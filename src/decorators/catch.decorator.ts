import { EXCEPTION_METADATA_KEY } from "../constants/exception.constants";
import { Type } from "../core/interfaces/type.interfaces";

/**
 * Catch Decorator
 * Exception Filter에서 처리할 예외 타입을 지정하는 Decorator
 * 
 * @param exceptions - 처리할 예외 타입(class) 배열
 * 
 * @example
 * @Catch(HttpException)
 * export class ExceptionFilter implements ExceptionFilter {
 *     catch(exception: HttpException, host: ArgumentsHost) {
 *         console.log("HttpException 처리");
 *     }
 * }
 * 
 * @Catch(HttpException, ForbiddenException)
 * export class ExceptionFilter implements ExceptionFilter {
 *     catch(exception: HttpException | ForbiddenException, host: ArgumentsHost) {
 *         console.log("HttpException 또는 ForbiddenException 처리");
 *     }
 * }
 */
export function Catch(
    ...exceptions: Type<any>[]
): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(EXCEPTION_METADATA_KEY.EXCEPTIONS, exceptions, target);
    };
}
