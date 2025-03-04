// 예외 처리 영역 
import { rethrow } from "../utils/shared.utils";


/**
 * 예외 처리 영역 클래스
 * 예외 처리 영역을 관리하는 클래스
 * 
 * risky 코드를 실행하는 경우 예외 처리 영역을 사용하여 예외 처리를 할 수 있습니다.
 * @example
 * 
 * 동기함수의 경우 아래와 같이 사용합니다.
 * ExceptionsZone.run(
 *     () => { doSomethingRisky() },
 *     (error) => { handleError(error) },
 *     true // 로그 자동 플러시 여부
 * );
 * 
 * 비동기함수의 경우 아래와 같이 사용합니다.
 * ExceptionsZone.asyncRun(
 *     async () => { await doSomethingRisky() },
 *     (error) => { handleError(error) },
 *     true // 로그 자동 플러시 여부
 * );
 */
export class ExceptionsZone {

    /** 동기 함수 실행을 위한 예외 처리 영역 
    * @param callback - 실행할 함수
    * @param teardown - 예외 처리 후 실행할 함수
    * @param autoFlushLogs - 로그 자동 플러시 여부
    */
    static run(
        callback: Function,
        teardown?: Function,
        autoFlushLogs: boolean = false
    ): void {
        try {
            callback();
        } catch (error) {
            if (autoFlushLogs) {
                console.error(error);
            }

            if (teardown) {
                teardown(error);
            } else {
                rethrow(error as Error);
            }
        }
    }

    /** 비동기 함수 실행을 위한 예외 처리 영역 
    * @param callback - 실행할 함수
    * @param teardown - 예외 처리 후 실행할 함수
    * @param autoFlushLogs - 로그 자동 플러시 여부
    */
    static async asyncRun(
        callback: Function,
        teardown?: Function,
        autoFlushLogs: boolean = false
    ): Promise<void> {
        try {
            await callback();
        } catch (error) {
            if (autoFlushLogs) {
                console.error(error);
            }
            
            if (teardown) {
                teardown(error);
            } else {
                rethrow(error as Error);
            }
        }
    }
}