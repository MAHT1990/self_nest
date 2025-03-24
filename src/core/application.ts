// 애플리케이션 클래스 
import { Container } from "./container";
import { HttpAdapter } from "../adapters/http-adapter.interfaces";
import { ApplicationOptions } from "./interfaces/applicationOptions.interface";
import { ExceptionsZone } from "./exceptions-zone";
import { METADATA_KEY } from "../constants/shared.constants";
import { PipeContext } from "./pipes/pipe.context";
import { 
    HttpException, 
    BadRequestException, 
    UnprocessableEntityException, 
    InternalServerErrorException,
    ValidationException
} from "../exceptions/http-exception";
import { GuardContext } from './guards/guard.context';
import { ExecutionContext } from './interfaces/executionContext.interface';
import { MiddlewareContext } from './middlewares/middleware.context';
import { ExceptionFilterContext } from '../exceptions/exception-filters/exception-filter.context';
import { ArgumentsHost } from './interfaces/arguments-host.interface';


/**
 * Application Class
 * 
 * @description 애플리케이션 실행 클래스
 */
export class Application {
    private middlewareContext: MiddlewareContext;
    private exceptionFilterContext: ExceptionFilterContext;

    constructor(
        private readonly container: Container,
        private readonly httpAdapter: HttpAdapter,
        private readonly options: ApplicationOptions = {}
    ) {
        // 미들웨어 컨텍스트 초기화
        this.middlewareContext = MiddlewareContext.getInstance();
        // Exception Filter 컨텍스트 초기화
        this.exceptionFilterContext = ExceptionFilterContext.getInstance();
    }

    /**
     * Route 등록
     */
    public registerRoutes(): void {
        const modules = Array.from(this.container.getModules().keys());

        modules.forEach(module => {
            const controllers = this.container.getControllers(module);

            controllers.forEach(controller => {
                const instance = this.container.getInstance(controller);
                const prefix = Reflect.getMetadata(METADATA_KEY.CONTROLLER, controller) || "";

                Object.getOwnPropertyNames(controller.prototype).forEach(key => {
                    if (key !== "constructor") {
                        const method = instance[key];
                        const routePath = Reflect.getMetadata(METADATA_KEY.ROUTE, method);
                        const httpMethod = Reflect.getMetadata(METADATA_KEY.METHOD, method);

                        if (routePath !== undefined && httpMethod !== undefined) {
                            const fullPath = `${prefix}${routePath}`;
                            const paramsMetadata = Reflect.getMetadata(METADATA_KEY.PARAMS, controller.prototype, key) || [];

                            /* 
                             * 미들웨어, 가드, 파이프 적용한 Wrapped Handler 생성
                             */
                            const wrappedHandler = this.createWrappedHandler(instance, key, paramsMetadata, fullPath, httpMethod);
                            
                            /* 메서드가 비동기인지 확인 */
                            const isAsync = instance[key].constructor.name === 'AsyncFunction';
                            
                            /* 예외 처리 래핑 - 동기/비동기에 따라 다른 래퍼 사용 */
                            const handler = isAsync 
                                ? this.createAsyncExceptionZone(wrappedHandler, key)
                                : this.createExceptionZone(wrappedHandler, key);

                            /* 라우트 등록 */
                            this.httpAdapter[httpMethod](fullPath, handler);
                        }
                    }
                });
            });
        });
    }

    /**
     * 서버 실행
     */
    public listen(port: number, callback?: () => void): void {
        this.httpAdapter.listen(port, callback);
    }

    /**
     * 미들웨어, 가드, 파이프가 모두 적용된 핸들러 생성
     */
    private createWrappedHandler(
        instance: any, 
        methodName: string, 
        paramsMetadata: any[], 
        fullPath: string, 
        httpMethod: string
    ): Function {
        return async (req: any, res: any, ...args: any[]) => {
            try {

                console.log(`Request: ${req}`);
                console.log(`Response: ${res}`);
                // 1. 미들웨어 적용
                const middlewareResult = await this.applyMiddlewares(req, res, fullPath, httpMethod);

                // 미들웨어에서 응답이 이미 전송되었으면 더 이상 진행하지 않음
                if (!middlewareResult || (res && res.headersSent)) {
                    return;
                }

                // 2. 가드 적용
                const guardResult = await this.applyGuards(instance, methodName, req, res);

                // 가드에서 거부된 경우 더 이상 진행하지 않음
                if (!guardResult || (res && res.headersSent)) {
                    return;
                }

                // 3. 파이프 적용 및 파라미터 처리 후 핸들러 호출
                return await this.applyPipes(instance, methodName, paramsMetadata, req, res, ...args);

            } catch (error) {
                // 미처리 예외는 최상위 예외 처리기에서 처리됨
                throw error;
            }
        };
    }

    /**
     * 미들웨어 적용 - 경로에 맞는 미들웨어 실행
     */
    private async applyMiddlewares(
        req: any, 
        res: any, 
        fullPath: string, 
        httpMethod: string
    ): Promise<boolean> {
        try {
            // 경로에 맞는 미들웨어 가져오기
            const middlewares = this.middlewareContext.getMiddlewaresForRoute(fullPath, httpMethod);
            
            // 미들웨어가 없는 경우 계속 진행
            if (!middlewares || middlewares.length === 0) {
                return true;
            }
            
            // 미들웨어 체인 실행
            return await this.middlewareContext.applyMiddlewares(middlewares, req, res);
        } catch (error) {
            console.error('미들웨어 적용 중 오류 발생:', error);
            return false;
        }
    }

    /**
     * 가드 적용 - 실행 컨텍스트 생성 후 가드 실행
     */
    private async applyGuards(
        instance: any, 
        methodName: string, 
        req: any, 
        res: any
    ): Promise<boolean> {
        // 실행 컨텍스트 생성
        const context: ExecutionContext = {
            getRequest: () => req,
            getResponse: () => res,
            getClass: () => instance.constructor,
            getHandler: () => instance[methodName]
        };

        // 메서드에 적용된 가드 가져오기
        const guards = Reflect.getMetadata(METADATA_KEY.GUARD, instance[methodName]) || [];
        
        // 가드 컨텍스트에서 가드 실행
        const guardContext = GuardContext.getInstance();
        return await guardContext.applyGuards(guards, context);
    }

    /**
     * 파이프 적용 및 파라미터 처리
     */
    private async applyPipes(
        instance: any, 
        methodName: string, 
        paramsMetadata: any[], 
        req: any, 
        res: any, 
        ...args: any[]
    ): Promise<any> {
        const pipeContext = PipeContext.getInstance();
        const params = [];

        // 파라미터 메타데이터를 기반으로 파라미터 추출 및 파이프 적용
        for (const { index, type, data, pipes } of paramsMetadata) {
            let value;

            // 파라미터 타입에 따라 값 추출
            switch (type) {
                case 'body':
                    value = data ? req.body?.[data] : req.body;
                    break;
                case 'param':
                    value = data ? req.params?.[data] : req.params;
                    break;
                case 'query':
                    value = data ? req.query?.[data] : req.query;
                    break;
                case 'req':
                    value = req;
                    break;
                case 'res':
                    value = res;
                    break;
                default:
                    value = undefined;
            }

            // 파이프 적용
            if (pipes && pipes.length > 0) {
                const metadata = { type, data, target: instance.constructor, method: methodName };
                value = await pipeContext.applyPipes(value, pipes, metadata);
            }

            params[index] = value;
        }

        // 컨트롤러 메서드 호출
        return instance[methodName](...params);
    }

    /**
     * 예외 처리 래핑 핵심 로직 - 동기 메서드용
     */
    private createExceptionZone(handler: Function, methodName: string): Function {
        return (req: any, res: any, ...args: any[]) => {
            let result: any;
            
            // ExceptionsZone을 통한 안전한 실행
            ExceptionsZone.run(() => {
                result = handler(req, res, ...args);
            }, (error: any) => {
                // 오류 발생 시 처리 로직
                console.error(`Error in ${methodName}:`, error);
                
                if (!res.headersSent) {
                    // ArgumentsHost 객체 생성
                    const host: ArgumentsHost = this.createArgumentsHost(req, res);
                    
                    // Exception Filter 처리 시도
                    try {
                        // 컨트롤러 인스턴스와 메서드 이름으로 핸들러 생성
                        const instance = this.findControllerInstance(req.originalUrl);
                        if (instance) {
                            const exceptionHandler = this.exceptionFilterContext.createExceptionHandler(
                                instance, 
                                methodName
                            );
                            exceptionHandler(error, host);
                            return; // 필터가 처리했으면 기본 예외 처리 생략
                        }
                    } catch (filterError) {
                        // 필터 적용 실패 시 기본 예외 처리로 대체
                        console.error('Exception filter 처리 실패:', filterError);
                    }
                    
                    // 기존 예외 처리 로직 실행 (필터가 처리하지 못한 경우)
                    const exception = this.convertToHttpException(error);
                    const status = exception.getStatus();
                    const response = exception.getResponse();
                    
                    res.statusCode = status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        statusCode: status,
                        message: typeof response === 'object' ? response.message : response,
                        timestamp: new Date().toISOString()
                    }));
                }
                
                // 디버깅 목적으로 오류 다시 던지기 (옵션에 따라)
                if (this.options.abortOnError !== false) {
                    throw error;
                }
            }, this.options.autoFlushLogs !== false);
            
            return result;
        };
    }

    /**
     * 비동기 메서드를 위한 예외 처리 래핑
     */
    private createAsyncExceptionZone(handler: Function, methodName: string): Function {
        return async (req: any, res: any, ...args: any[]) => {
            try {
                return await handler(req, res, ...args);
            } catch (error) {
                console.error(`Error in async ${methodName}:`, error);
                
                if (!res.headersSent) {
                    // ArgumentsHost 객체 생성
                    const host: ArgumentsHost = this.createArgumentsHost(req, res);
                    
                    // Exception Filter 처리 시도
                    try {
                        // 컨트롤러 인스턴스와 메서드 이름으로 핸들러 생성
                        const instance = this.findControllerInstance(req.originalUrl);
                        if (instance) {
                            const exceptionHandler = this.exceptionFilterContext.createExceptionHandler(
                                instance, 
                                methodName
                            );
                            exceptionHandler(error, host);
                            return; // 필터가 처리했으면 기본 예외 처리 생략
                        }
                    } catch (filterError) {
                        // 필터 적용 실패 시 기본 예외 처리로 대체
                        console.error('Exception filter 처리 실패:', filterError);
                    }
                    
                    // 기존 예외 처리 로직 실행 (필터가 처리하지 못한 경우)
                    const exception = this.convertToHttpException(error);
                    const status = exception.getStatus();
                    const response = exception.getResponse();
                    
                    res.statusCode = status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                        statusCode: status,
                        message: typeof response === 'object' ? response.message : response,
                        timestamp: new Date().toISOString()
                    }));
                }
                
                // 디버깅 목적으로 오류 다시 던지기 (옵션에 따라)
                if (this.options.abortOnError !== false) {
                    throw error;
                }
            }
        };
    }

    /**
     * ArgumentsHost 객체 생성
     * 
     * @param req 요청 객체
     * @param res 응답 객체
     * 
     * @returns ArgumentsHost 객체
     */
    private createArgumentsHost(req: any, res: any): ArgumentsHost {
        return {
            getType: <T>() => 'http' as T,
            getArgs: <T>() => [req, res] as T,
            getArgByIndex: <T>(index: number) => index === 0 ? req : res as T,
            switchToHttp: () => ({
                getRequest: () => req,
                getResponse: () => res,
                getNext: <T>() => null as T
            })
        };
    }

    /**
     * 요청 URL을 기반으로 컨트롤러 인스턴스 찾기
     * @param url 요청 URL
     */
    private findControllerInstance(url: string): any {
        // 모든 모듈의 컨트롤러를 확인
        const modules = Array.from(this.container.getModules().keys());
        
        for (const module of modules) {
            const controllers = this.container.getControllers(module);
            
            for (const controller of controllers) {
                const instance = this.container.getInstance(controller);
                const prefix = Reflect.getMetadata(METADATA_KEY.CONTROLLER, controller) || "";
                
                // URL이 컨트롤러 프리픽스로 시작하는지 확인
                if (url.startsWith(prefix)) {
                    return instance;
                }
            }
        }
        
        return null;
    }

    /**
     * 전역 예외 필터 등록
     * @param filters 등록할 예외 필터 목록
     */
    public useGlobalFilters(...filters: any[]): void {
        filters.forEach(filter => {
            this.exceptionFilterContext.addGlobalFilter(filter);
        });
    }

    /**
     * 일반 오류를 HttpException으로 변환
     */
    private convertToHttpException(error: any): HttpException {
        if (error instanceof HttpException) {
            return error;
        }
        
        if (error instanceof ValidationException) {
            return new UnprocessableEntityException(error.message);
        }
        
        if (error instanceof SyntaxError || error instanceof TypeError) {
            return new BadRequestException(error.message);
        }
        
        return new InternalServerErrorException(error.message || 'Internal server error');
    }
}