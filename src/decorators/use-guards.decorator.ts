import { METADATA_KEY } from "../constants/shared.constants";
import { CanActivate } from "../core/guards/guard.interfaces";


/**
 * UseGuards Decorator
 * 컨트롤러 또는 메서드에 가드를 적용하는 데코레이터
 * 
 * @param guards - 적용할 가드 목록
 * @returns ClassDecorator | MethodDecorator - 컨트롤러 또는 메서드 데코레이터
 */
export function UseGuards(
    ...guards: CanActivate[]
): ClassDecorator & MethodDecorator {
    return (
        target: any,
        key?: string | symbol,
        descriptor?: TypedPropertyDescriptor<any>
    ) => {
        /* Method Decorator */
        if (descriptor) {
            Reflect.defineMetadata(
                METADATA_KEY.GUARD,
                guards,
                descriptor.value
            );
            return descriptor;
        }

        /* Class Decorator */
        Reflect.defineMetadata(
            METADATA_KEY.GUARD,
            guards,
            target
        );

        return target;
    };
}
