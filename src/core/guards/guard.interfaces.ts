import { ExecutionContext } from "../interfaces";


/**
 * Guard Interface
 * interface for all guards
 */
export interface CanActivate {
    /**
     * 요청을 확인하고 허용 여부를 결정
     * Route Handler 실행 전 호출
     * 
     * @param context - 실행 컨텍스트
     * @returns boolean - 요청 허용 여부
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}