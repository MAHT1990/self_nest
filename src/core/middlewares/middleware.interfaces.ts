/**
 * Middleware Interface
 * 
 * @description 미들웨어의 인터페이스
 */
export interface NestMiddleware {
    use(
        request: Request,
        response: Response,
        next: () => void
    ): void;
}

/**
 * Middleware 함수 타입
 */
export type MiddlewareFunction = (
    request: Request,
    response: Response,
    next: () => void
) => void;

/**
 * Middleware 타입
 * 
 * @see NestMiddleware
 * @see MiddlewareFunction
 */
export type Middleware = NestMiddleware | MiddlewareFunction;

/**
 * Route Info Interface
 */
export interface RouteInfo {
    path: string;
    method?: string;
}

/**
 * Middleware Config Interface
 */
export interface MiddlewareConfiguration {
    middlewares: Middleware[];
    routes: RouteInfo[];
}