// 애플리케이션 클래스 
import { HttpAdapter, ApplicationOptions, Type } from "./interfaces";
import { Container } from "./container";
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

export class Application {
    constructor(
        private readonly container: Container,
        private readonly httpAdapter: HttpAdapter,
        private readonly options: ApplicationOptions = {}
    ) {}

    /* Route 등록 */
    registerRoutes(): void {
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

                            /* 파이프 핸들러 생성 */
                            const pipeHandler = this.createPipeHandler(instance, key, paramsMetadata);
                            
                            /* 메서드가 비동기인지 확인 */
                            const isAsync = instance[key].constructor.name === 'AsyncFunction';
                            
                            /* 예외 처리 래핑 - 동기/비동기에 따라 다른 래퍼 사용 */
                            const handler = isAsync 
                                ? this.createAsyncExceptionZone(pipeHandler, key)
                                : this.createExceptionZone(pipeHandler, key);

                            /* 라우트 등록 */
                            this.httpAdapter[httpMethod](fullPath, handler);
                        }
                    }
                });
            });
        });
    }

    listen(port: number, callback?: () => void): void {
        this.httpAdapter.listen(port, callback);
    }

    /* 예외 처리 래핑 핵심 로직 - 동기 메서드용 */
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

    /* 비동기 메서드를 위한 예외 처리 래핑 */
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

    /* 오류를 HTTP 예외로 변환 */
    private convertToHttpException(error: any): HttpException {
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

    private createPipeHandler(
        instance: any,
        methodName: string,
        paramsMetadata: any[]
    ): Function {
        const pipeContext = PipeContext.getInstance();

        return async (req: any, res: any) => {
            const args = [];

            for (const metadata of paramsMetadata) {
                if (metadata) {
                    const { type, data, pipes, index } = metadata;
                    let value;

                    /* Type에 따라 값 추출 */
                    switch (type) {
                        case "body":
                            value = req.body;
                            break;
                        case "query":
                            value = req.query[data];
                            break;
                        case "param":
                            value = req.params[data];
                            break;
                        default:
                            value = undefined;
                    }

                    const argumentMetadata = {
                        type,
                        data,
                        metatype: undefined,
                    };

                    /* 파이프 적용하여 값 변환 */
                    const transformedValue = await pipeContext.applyPipes(value, pipes || [], argumentMetadata);
                    args[index] = transformedValue;
                }
            }

            /* 메서드 호출 및 결과 반환 */
            return await instance[methodName].apply(instance, args);
        }
    }
}