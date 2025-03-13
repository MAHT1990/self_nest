import { METADATA_KEY } from "../constants/shared.constants";
import { PipeTransform } from "../core/pipes/pipe.interfaces";


/**
 * 파라미터 데코레이터 Factory 의 Factory
 * 
 * @description request 내의 정보(type)별 파라미터 데코레이터 팩토리 생성
 * 
 * @param type - 파라미터 타입
 * @returns 파라미터 데코레이터 Factory
 */
function createParamDecorator(
    type: "body" | "query" | "param" | "custom",
) {

    /**
     * 파라미터 데코레이터 Factory
     * 
     * @param data - 파라미터 이름 (params의 키 값, query의 키 값, body의 키 값)
     * @param pipes - 파이프 목록
     */
    return (
        data?: string,
        ...pipes: PipeTransform[]
    ): ParameterDecorator => {

        /**
         * 파라미터 데코레이터
         * 
         * @param target - 대상 객체
         * @param key - 메서드 키
         * @param parameterIndex - 파라미터 인덱스
         */
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

