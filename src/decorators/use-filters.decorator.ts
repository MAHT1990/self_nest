import { EXCEPTION_METADATA_KEY } from "../constants/exception.constants";
import { ExceptionFilter, ExceptionFilterClass } from "../exceptions/exception-filters/exception-filter.interfaces";

/**
 * UseFilters 데코레이터
 * - Controller, Method 레벨에서 예외 필터 적용
 */
export function UseFilters(
    ...filters: (ExceptionFilterClass | ExceptionFilter<any>)[]
): MethodDecorator & ClassDecorator {
    return (
        target: any,
        key?: string | symbol,
        descriptor?: PropertyDescriptor
    ) => {
        /* 메서드 레벨 데코레이터 */
        if (descriptor) {
            Reflect.defineMetadata(
                EXCEPTION_METADATA_KEY.FILTERS,
                [...(Reflect.getMetadata(EXCEPTION_METADATA_KEY.FILTERS, target, key!) || []), ...filters],
                descriptor.value
            );
            return descriptor;
        }

        /* 클래스 레벨 데코레이터 */
        Reflect.defineMetadata(
            EXCEPTION_METADATA_KEY.FILTERS,
            [...(Reflect.getMetadata(EXCEPTION_METADATA_KEY.FILTERS, target) || []), ...filters],
            target
        );
        return target;
    }
}
