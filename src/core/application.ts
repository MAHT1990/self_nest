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


/**
 * Application Class
 * 
 * @description 애플리케이션 실행 클래스
 */
export class Application {
    constructor(
        private readonly container: Container,
        private readonly httpAdapter: HttpAdapter,
        private readonly options: ApplicationOptions = {}
    ) {}

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
                             * 가드, 파이프 적용한 Wrapped Handler 생성
                             */
                            const wrappedHandler = this.createWrappedHandler(instance, key, paramsMetadata);
                            
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
                return await ExceptionsZone.asyncRun(
                    async () => await handler(req, res, ...args),
                    (error: any) => {
                        console.error(`Async error in ${methodName}:`, error);
                        
                        if (!res.headersSent) {
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
                    },
                    this.options.autoFlushLogs !== false
                );
            } catch (error) {
                // 최종 에러 처리 및 응답 변환
                if (this.options.abortOnError !== false) {
                    throw error;
                }
                return null;
            }
        };
    }

    /**
     * 오류를 HTTP 예외로 변환
     */
    private convertToHttpException(
        error: any
    ): HttpException {
        if (error instanceof HttpException) {
            return error;
        }
        
        // 다양한 오류 유형에 따른 적절한 HTTP 예외 반환
        if (error instanceof TypeError) {
            return new BadRequestException(error.message);
        }
        
        if (error instanceof ValidationException) {
            return new UnprocessableEntityException(error.message);
        }
        
        // 기본값은 500 내부 서버 오류
        return new InternalServerErrorException(
            error.message || '내부 서버 오류가 발생했습니다'
        );
    }

    /**
     * 가드와 파이프가 적용된 래핑된 핸들러 생성
     */
    private createWrappedHandler(
        instance: any,
        methodName: string,
        paramsMetadata: any[]
    ): Function {
        return async (req: any, res: any) => {
            try {
                /* 1. 실행 컨텍스트 생성 */
                const context: ExecutionContext = this.createExecutionContext(instance, methodName, req, res);
                
                /* 2. 가드 적용 */
                const canProceed = await this.applyGuards(instance, methodName, context);
                if (!canProceed) {
                    res.status(403).json({ message: 'Forbidden' });
                    return;
                }
                
                /* 3. 파이프 적용 및 파라미터 변환 */
                const args = await this.applyPipes(req, paramsMetadata);
                
                /* 4. 컨트롤러 메서드(라우트 핸들러) 실행 */
                return await instance[methodName].apply(instance, args);

            } catch (error) {
                /* 에러 처리 */
                res.status(500).json({ 
                    message: (error as any).message || 'Internal Server Error',
                    status: (error as any).status || 500
                });
            }
        };
    }

    /**
     * 실행 컨텍스트 생성
     */
    private createExecutionContext(
        instance: any, 
        methodName: string,
        req: any,
        res: any
    ): ExecutionContext {
        return {
            getRequest: () => req,
            getResponse: () => res,
            getClass: () => instance.constructor,
            getHandler: () => instance[methodName]
        };
    }

    /**
     * 가드 적용 로직
     */
    private async applyGuards(
        instance: any,
        methodName: string,
        context: ExecutionContext
    ): Promise<boolean> {
        const guardContext = GuardContext.getInstance();
        
        /* 가드 메타데이터 검색 */
        const methodGuards = Reflect.getMetadata(METADATA_KEY.GUARD, instance[methodName]) || [];
        const classGuards = Reflect.getMetadata(METADATA_KEY.GUARD, instance.constructor) || [];
        const guards = [...classGuards, ...methodGuards];
        
        /* 가드 적용 */
        return await guardContext.applyGuards(guards, context);
    }

    /**
     * 파이프 적용 및 파라미터 변환 로직
     */
    private async applyPipes(
        req: any,
        paramsMetadata: any[]
    ): Promise<any[]> {
        const pipeContext = PipeContext.getInstance();
        const args: any[] = [];
        
        for (const metadata of paramsMetadata) {
            if (metadata) {
                const { type, data, pipes, index } = metadata;
                let value;
                
                /* 파라미터 소스에 따른 값 추출 */
                value = this.extractValueFromRequest(req, type, data);
                
                /* 파이프 적용 */
                const argumentMetadata = { type, data, metatype: undefined };
                const transformedValue = await pipeContext.applyPipes(
                    value, 
                    pipes || [], 
                    argumentMetadata
                );
                
                args[index] = transformedValue;
            }
        }
        
        return args;
    }

    /**
     * 요청에서 값 추출 로직
     */
    private extractValueFromRequest(
        req: any, 
        type: string, 
        data?: string
    ): any {
        switch (type) {
            case "body": return req.body;
            case "query": return req.query[data as string];
            case "param": return req.params[data as string];
            default: return undefined;
        }
    }
}