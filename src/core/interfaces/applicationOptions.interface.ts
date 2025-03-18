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