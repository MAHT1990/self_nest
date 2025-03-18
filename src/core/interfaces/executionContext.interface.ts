import { Type } from "./type.interfaces";

/**
 * 실행 컨텍스트
 * 핸들러 실행에 필요한 정보를 담음
 */
export interface ExecutionContext {
    /* 현재 요청 정보 */
    getRequest(): any;

    /* 현재 응답 정보 */
    getResponse(): any;

    /* handler class */
    getClass(): Type<any>;

    /* handler method */
    getHandler(): Function;
}