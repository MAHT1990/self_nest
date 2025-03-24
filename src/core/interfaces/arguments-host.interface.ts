/**
 * 실행 컨텍스트 호스트 인터페이스
 * HTTP, RPC, WS 등 다양한 프로토콜에서 사용
 */
export interface ArgumentsHost {
    /**
     * Context의 유형 반환
     */
    getType<T = string>(): T;

    /**
     * 원본 인자 배열 반환
     */
    getArgs<T extends any[] = any[]>(): T;

    /**
     * 원본 인자 배열 반환
     */
    getArgByIndex<T = any>(index: number): T;

    /**
     * HTTP 컨텍스트로 변환
     */
    switchToHttp(): HttpArgumentsHost;
}

/**
 * HTTP 컨텍스트 인터페이스
 */
export interface HttpArgumentsHost {
    /**
     * 요청 객체 반환
     */
    getRequest<T = any>(): T;

    /**
     * 응답 객체 반환
     */
    getResponse<T = any>(): T;

    /**
     * 다음 함수 가져오기 (Express 미들웨어 호환)
     */
    getNext<T = any>(): T;
}