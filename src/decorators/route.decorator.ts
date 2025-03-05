// 라우트 데코레이터 

import { METADATA_KEY } from "../constants/shared.constants";


enum RequestMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
}


/**
 * 라우트 데코레이터
 * 라우트를 정의할 때 사용하는 데코레이터
 * - 메서드 메타데이터를 저장합니다.
 */
function createMappingDecorator(method: RequestMethod) {
    return (path: string = "") => {
        return (
            target: any,
            key: string | Symbol,
            descriptor: PropertyDescriptor
        ) => {
            Reflect.defineMetadata(METADATA_KEY.METHOD, method, descriptor.value);
            Reflect.defineMetadata(METADATA_KEY.ROUTE, path, descriptor.value);
            return descriptor;
        };
    };
}


export const Get = createMappingDecorator(RequestMethod.GET);
export const Post = createMappingDecorator(RequestMethod.POST);
export const Put = createMappingDecorator(RequestMethod.PUT);
export const Delete = createMappingDecorator(RequestMethod.DELETE);
export const Patch = createMappingDecorator(RequestMethod.PATCH);


