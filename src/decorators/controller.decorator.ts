// 컨트롤러 데코레이터 

import { METADATA_KEY } from "../constants/shared.constants";


/**
 * 컨트롤러 데코레이터
 * 컨트롤러를 정의할 때 사용하는 데코레이터
 * - 컨트롤러 메타데이터를 저장합니다.
 */
export function Controller(prefix: string = ""): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(METADATA_KEY.CONTROLLER, prefix, target);
    };
}