import { ArgumentsHost } from "../../core/interfaces/arguments-host.interface";

/**
 * Exception Filter Interface
 * - 모든 예외 필터는 이 인터페이스를 구현해야 함
 */
export interface ExceptionFilter<T = any> {
    /**
     * 예외 처리 Method
     * @param exception - 예외 객체
     * @param host - 현재 실행 컨텍스트
     */
    catch(exception: T, host: ArgumentsHost): any;
}

/**
 * Exception Filter Type
 * - 예외 필터의 생성자(Class)
 */
export type ExceptionFilterClass = new (...args: any[]) => ExceptionFilter;