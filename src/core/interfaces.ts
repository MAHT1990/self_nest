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