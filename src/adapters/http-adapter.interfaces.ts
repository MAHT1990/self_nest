/**
 * HTTP Adapter Interface
 * HTTP 어댑터의 인터페이스
 */
export interface HttpAdapter {
    /* 서버 실행 */
    listen(port: number, callback?: () => void): void;

    /* GET 요청 처리 */
    get(path: string, handler: Function): void;

    /* POST 요청 처리 */
    post(path: string, handler: Function): void;

    /* PUT 요청 처리 */
    put(path: string, handler: Function): void;

    /* DELETE 요청 처리 */
    delete(path: string, handler: Function): void;

    /* PATCH 요청 처리 */
    patch(path: string, handler: Function): void;
    
    /* 동적 메서드 접근을 위한 인덱스 시그니처 */
    [key: string]: any;
}