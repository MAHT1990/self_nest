import { Middleware, MiddlewareConfiguration, RouteInfo } from "./middleware.interfaces";
import { Type } from "../interfaces/type.interfaces";
import { MiddlewareConsumer } from "./middleware.consumer";

/**
 * Middleware Configurer Class
 */
export class MiddlewareRouteConfigurer {
    constructor(
        private readonly middlewares: Middleware[],
        private readonly configs: MiddlewareConfiguration[]
    ) {}

    /**
     * Middleware를 적용할 route 정보를 추가합니다.
     * 
     * @param routes route 정보
     */
    forRoutes(
        ...routes: (string | Type<any> | RouteInfo)[]
    ): MiddlewareConsumer {
        const routeInfos: RouteInfo[] = routes.map(route => {

            /* 문자열인 경우 */
            if (typeof route === "string") {
                return { path: route }
            }

            /* 함수(Controller class)인 경우, 경로 접두사 추출 */
            if (typeof route === "function") {
                const prefix = Reflect.getMetadata("path", route) || "";
                return { path: prefix };
            }

            /* RouteInfo인 경우 */
            return route as RouteInfo;
        });

        this.configs.push({
            middlewares: this.middlewares,
            routes: routeInfos
        });

        return new MiddlewareConsumer();
    }
}