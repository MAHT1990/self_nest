// 핵심 인터페이스 정의 


/**
 * 클래스 타입 확장
 * T 타입의 생성자 타입을 나타냅니다.
 * 
 * @example
 * Type<UserService>는 UserService 클래스의 생성자 타입을 나타냅니다
 * const userServiceType: Type<UserService> = UserService;
 * 
 * 이제 이 타입을 사용하여 새로운 인스턴스를 생성할 수 있습니다
 * const userService = new userServiceType("John");
 */
export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}


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


/**
 * ApplicationOptions 인터페이스
 * 애플리케이션 옵션을 정의하는 인터페이스
 */
export interface ApplicationOptions {
    /* 오류 발생 시 즉시 종료 */
    abortOnError?: boolean;

    /* 로그 자동 플러시 */
    autoFlushLogs?: boolean;
}


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