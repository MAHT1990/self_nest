import { Type } from "./type.interfaces";


/**
 * 모듈 메타데이터 인터페이스
 * 모듈의 메타데이터를 정의하는 인터페이스
 */
export interface ModuleMetadata {
    /* 모듈에 포함될 모듈들을 지정합니다. */
    imports?: any[];

    /* 모듈에 포함될 컨트롤러들을 지정합니다. */
    controllers?: Type<any>[];

    /* 모듈에 포함될 프로바이더들을 지정합니다. */
    providers?: Type<any>[];

    /* 모듈에 포함될 내보낼 프로바이더들을 지정합니다. */
    exports?: Type<any>[];
}