// 유틸리티 함수 


/**
 * 주어진 객체가 함수인지 확인
 * 
 * @param obj - 확인할 객체
 * @returns 함수인 경우 true, 그렇지 않은 경우 false
 */
export const isFunction = (obj: any): obj is Function => {
    return typeof obj === 'function';
}


/**
 * 예외 다시 던지기
 * 
 * @param error - 예외 객체
 * @returns 예외 객체
 */
export const rethrow = (error: Error): never => {
    throw error;
}


