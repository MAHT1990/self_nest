// 애플리케이션 클래스 
import { HttpAdapter, ApplicationOptions, Type } from "./interfaces";
import { Container } from "./container";
import { ExceptionsZone } from "./exceptions-zone";
import { METADATA_KEY } from "../constants/shared.constants";
import { PipeContext } from "./pipes/pipe.context";


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

                            /* 예외 처리 래핑 */
                            const wrappedMethod = this.createExceptionZone(instance, key);

                            /* 파이프 래핑 */
                            const wrappedMethodWithPipes = this.createPipeHandler(instance, key, paramsMetadata);

                            /* 라우트 등록 */
                            this.httpAdapter[httpMethod](fullPath, wrappedMethodWithPipes);
                        }
                    }
                });
            });
        });
    }

    listen(port: number, callback?: () => void): void {
        this.httpAdapter.listen(port, callback);
    }

    /* 예외 처리 래핑 */
    private createExceptionZone(
        receiver: Record<string, any>,
        prop: string
    ): Function {
        const abortOnError = this.options.abortOnError !== false;
        const autoFlushLogs = this.options.autoFlushLogs !== false;

        return (...args: unknown[]) => {
            let result: unknown;

            ExceptionsZone.run(
                () => { result = receiver[prop].apply(receiver, args) },
                !abortOnError ? (e: Error) => { throw e } : undefined,
                autoFlushLogs
            );

            return result;
        };
    }

    private createPipeHandler(
        instance: any,
        methodName: string,
        paramsMetadata: any[]
    ): Function {
        const pipeContext = PipeContext.getInstance();

        return async (req: any, res: any) => {
            try {
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

                        const transformedValue = await pipeContext.applyPipes(value, pipes || [], argumentMetadata);
                        args[index] = transformedValue;
                    }
                }

                const result = await instance[methodName].apply(instance, args);
                return result;
            } catch (error) {
                throw error;
            }
        }
    }
}