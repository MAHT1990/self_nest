import { CanActivate } from "./guard.interfaces";
import { ExecutionContext } from "../interfaces/executionContext.interface";


/**
 * GuardContext Class
 * 
 * @description Guard의 실행 컨텍스트 관리
 */
export class GuardContext {
    private static instance: GuardContext;
    private globalGuards: CanActivate[] = [];

    /**
     * singleton instance
     */
    static getInstance(): GuardContext {
        if (!GuardContext.instance) {
            GuardContext.instance = new GuardContext();
        }
        return GuardContext.instance;
    }

    /**
     * 전역 Guard 추가
     */
    addGlobalGuard(
        guard: CanActivate
    ): void {
        this.globalGuards.push(guard);
    }

    /**
     * 가드 적용
     * @param guards - 적용할 지역 guard 목록
     * @param context - 실행 컨텍스트
     * @returns boolean - 가드 결과
     * 
     * @see applyGuard
     */
    async applyGuards(
        guards: CanActivate[],
        context: ExecutionContext
    ): Promise<boolean> {
        /* 전역 가드 적용 */
        for (const guard of this.globalGuards) {
            const result = await this.applyGuard(guard, context);
            if (!result) return false;
        }

        /* 지역 가드 적용 */
        for (const guard of guards) {
            const result = await this.applyGuard(guard, context);
            if (!result) return false;
        }

        return true;
    }

    /**
     * 단일 가드 적용
     * @param guard - 적용할 guard
     * @param context - 실행 컨텍스트
     * @returns boolean - 가드 결과
     */
    private async applyGuard(
        guard: CanActivate,
        context: ExecutionContext
    ): Promise<boolean> {
        const result = guard.canActivate(context);
        return result instanceof Promise ? result : Promise.resolve(result);
    }
}