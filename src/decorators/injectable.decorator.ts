// 프로바이더 데코레이터

import { METADATA_KEY } from "../constants/shared.constants";


/**
 * 프로바이더 데코레이터
 * 프로바이더를 정의할 때 사용하는 데코레이터
 * - Injectable 메타데이터를 저장합니다.
 */
export function Injectable(): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(METADATA_KEY.INJECTABLE, true, target);
    };
}
