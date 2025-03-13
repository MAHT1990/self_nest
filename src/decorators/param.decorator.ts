import { METADATA_KEY } from "../constants/shared.constants";
import { PipeTransform } from "../core/pipes/pipe.interfaces";


/**
 * Param Decorator
 */
function createParamDecorator(
    type: "body" | "query" | "param" | "custom",
) {
    return (
        data?: string,
        ...pipes: PipeTransform[]
    ): ParameterDecorator => {
        return (
            target: Object,
            key?: string | symbol,
            parameterIndex?: number
        ) => {
            const paramMetadata = {
                type,
                data,
                pipes,
                index: parameterIndex
            };

            /* 파라미터 메타데이터 저장 */
            const existingMetadata = Reflect.getMetadata(
                METADATA_KEY.PARAMS,
                target,
                key!
            ) || [];
            
            /* 해당 Index에 Metadata 추가 */
            existingMetadata[parameterIndex!] = paramMetadata;

            /* 메타데이터 저장 */
            Reflect.defineMetadata(
                METADATA_KEY.PARAMS,
                existingMetadata,
                target,
                key!
            );
        }
    }
}

/**
 * path param 데코레이터
 * @example @Param('id', ParseIntPipe)
 */
export const Param = createParamDecorator("param");

/**
 * query param 데코레이터
 * @example @Query('name')
 */
export const Query = createParamDecorator("query");

/**
 * body param 데코레이터
 * @example @Body(ValidationPipe)
 */
export const Body = createParamDecorator("body");

