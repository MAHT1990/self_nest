/**
 * 실행 컨텍스트 호스트 인터페이스
 * - 실행 컨텍스트의 추상화: HTTP, RPC, WS 등 일관된 방식으로 요청 관련 객체에 접근 가능
 * - 컨텍스트간 전환: 다양한 유형의 어플리케이션에서 동일한 exception-filter, guard, pipe 등 재사용 가능
 * - 실행 컨텍스트 정보 제공: guard, filter, pipe 등 필요한 요청/응답 객체 및 컨텍스트 정보 제공
 *
 * @method getType(): 실행 컨텍스트 유형
 * @method getArgs(): 원본 인자 배열
 * @method getArgByIndex(): 인덱스에 해당하는 인자 반환
 * @method switchToHttp(): HTTP 컨텍스트로 변환
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