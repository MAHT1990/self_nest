import { Middleware, NestMiddleware, MiddlewareFunction, RouteInfo } from "./middleware.interfaces";
import { Type } from "../interfaces/type.interfaces";

/**
 * Middleware Context Class
 * 
 * @description 미들웨어 컨텍스트 클래스
 * - Singleton 패턴을 사용하여 middleware context 관리.
 * - 전역 미들웨어와 모듈 미들웨어를 관리.
 * - 미들웨어 실행 함수를 생성하고, middleware chain을 실행.
 */
export class MiddlewareContext {
    private static instance: MiddlewareContext;
    private globalMiddlewares: Middleware[] = [];
    private moduleMiddlewares: Map<string, Array<{ middleware: Middleware, routeInfo: RouteInfo }>> = new Map();

    /**
     * 싱글톤 인스턴스 반환
     */
    public static getInstance(): MiddlewareContext {
        if (!MiddlewareContext.instance) {
            MiddlewareContext.instance = new MiddlewareContext();
        }
        return MiddlewareContext.instance;
    }

    /**
     * 전역 미들웨어 등록
     */
    public addGlobalMiddleware(middleware: Middleware): void {
        this.globalMiddlewares.push(middleware);
    }
    
    /**
     * 모듈 미들웨어 등록
     */
    public addModuleMiddlewares(
        moduleName: string,
        middlewares: Array<{ middleware: Middleware, routeInfo: RouteInfo }>
    ): void {
        const existingMiddlewares = this.moduleMiddlewares.get(moduleName) || [];
        this.moduleMiddlewares.set(moduleName, [...existingMiddlewares, ...middlewares]);
    }

    /**
     * route에 적용할 middleware 조회
     */
    public getMiddlewaresForRoute(
        path: string,
        method?: string
    ): Array<Middleware> {
        const middlewares: Middleware[] = [ ...this.globalMiddlewares ];

        /* 모든 Module에 대하여 현재 경로에 적용된 middleware 조회 */
        for (const [ _, moduleMiddlewares ] of this.moduleMiddlewares.entries()) {
            moduleMiddlewares.forEach(({ middleware, routeInfo }) => {
                /* path check */
                if (this.isRouteMatched(path, method, routeInfo)) {
                    middlewares.push(middleware);
                }
           });
        }

        return middlewares;
    }

    /**
     * Middleware 실행 함수 생성
     */
    public createMiddlewareHandler(
        middleware: Middleware
    ): MiddlewareFunction {
        if (typeof middleware === "function") return middleware;

        const instance = middleware instanceof Function
            ? new (middleware as unknown as Type<NestMiddleware>)()
            : middleware;

        return (req, res, next) => {
            instance.use(req, res, next);
        };
    }

    /**
     * middleware chain 실행
     */
    public async applyMiddlewares(
        middlewares: Middleware[],
        req: any,
        res: any
    ): Promise<boolean> {
        return new Promise((resolve) => {
            const middleware = middlewares.map(m => this.createMiddlewareHandler(m));

            const next = (index: number) => {
                if (index >= middleware.length) return resolve(true);

                const current = middleware[index];

                try {
                    current(req, res, () => next(index + 1));
                } catch (error) {
                    console.error(error);
                    resolve(false);
                }
            }

            next(0);
        });
    }

    /**
     * route 일치 여부 확인
     */
    private isRouteMatched(
        path: string,
        method: string | undefined,
        routeInfo: RouteInfo
    ): boolean {
        /* path check */
        const pathMatched = path.startsWith(routeInfo.path) ||
            routeInfo.path === "*" ||
            routeInfo.path === "";

        /* method check */
        const methodMatched = !routeInfo.method ||
            !method ||
            routeInfo.method.toLowerCase() === method.toLowerCase();

        return pathMatched && methodMatched;
    }
}