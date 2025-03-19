import { Middleware, MiddlewareConfiguration } from "./middleware.interfaces";
import { MiddlewareRouteConfigurer } from "./middleware.routeConfigurer";

/**
 * Middleware Consumer Class
 * 
 * @description 미들웨어 소비자 클래스
 */
export class MiddlewareConsumer {
    private readonly middlewareConfigs: MiddlewareConfiguration[] = [];

    /**
     * Middleware 적용
     * 
     * @param middleware - 적용할 미들웨어
     */
    apply(
        ...middlewares: Middleware[]
    ): MiddlewareRouteConfigurer {
        return new MiddlewareRouteConfigurer(middlewares, this.middlewareConfigs);
    }

    /**
     * 등록된 middleware 정보 조회
     */
    getConfigs(): MiddlewareConfiguration[] {
        return this.middlewareConfigs;
    }
}