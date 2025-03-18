// 모듈 데코레이터
import { METADATA_KEY } from "../constants/shared.constants";
import { ModuleMetadata } from "../core/interfaces/moduleMetadata.interface";


/**
 * 모듈 데코레이터
 * 모듈을 정의할 때 사용하는 데코레이터
 * - ModuleMetadata 인터페이스에 정의된 메타데이터를 저장합니다.
 */
export function Module(metadata: ModuleMetadata): ClassDecorator {
    return (target: Function) => {
        Reflect.defineMetadata(METADATA_KEY.MODULE, metadata, target);
    };
}