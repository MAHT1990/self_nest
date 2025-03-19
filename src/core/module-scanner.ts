import { Container } from "./container";
import { Type } from "./interfaces/type.interfaces";
import { METADATA_KEY } from "../constants/shared.constants";
import { NestModule } from "./interfaces/module.interface";
import { MiddlewareConsumer } from "./middlewares/middleware.consumer";
import { MiddlewareContext } from "./middlewares/middleware.context";

/**
 * 모듈 스캐닝 클래스
 * @param {Container} container - 컨테이너 인스턴스
 * @param {Type<any>} entryModule - 진입점 모듈
 * 
 * @description 
 * 주어진 진입점 모듈을 기반으로 모듈 의존성을 스캐닝하고, 
 * container 에 등록합니다.
 * - 모듈 스캐닝은 주어진 module의 metadata를 확인하고,
 * - 해당 module과 module의 imports 모듈을 재귀적으로 스캐닝하여 container에 등록합니다.
 * 
 * @example
 * const moduleScanner = new ModuleScanner(container);
 * moduleScanner.scan(entryModule);
 */
export class ModuleScanner {
    constructor(private container: Container) {}

    /* Module, Dependency Scan */
    async scan(entryModule: Type<any>): Promise<void> {
        await this.scanModule(entryModule);
        await this.configureMiddlewares(entryModule);
    }

    private scanModule(module: Type<any>): void {
        this.container.registerModule(module);

        const metadata = Reflect.getMetadata(METADATA_KEY.MODULE, module) || {};

        if (metadata.imports) {
            metadata.imports.forEach((importModule: Type<any>) => {
                this.scanModule(importModule);
            });
        }
    }

    /**
     * 모듈 미들웨어 설정
     * 
     * @param module - 모듈 생성자(Token)
     */
    private async configureMiddlewares(module: Type<any>): Promise<void> {
        const moduleInstance = this.container.getInstance(module);

        /* 
         * 모듈 인스턴스가 NestModule 인터페이스를 구현하고, 
         * configure 메서드를 가지고 있는 경우
         */
        if (moduleInstance && "configure" in moduleInstance) {
            const nestModule = moduleInstance as unknown as NestModule;

            const consumer = new MiddlewareConsumer();

            /* Module method: configure 호출 */
            nestModule.configure(consumer);

            /* 모듈 미들웨어 설정 조회 */
            const configs = consumer.getConfigs();

            /* middleware context에 등록 */
            const middlewareContext = MiddlewareContext.getInstance();

            configs.forEach((config) => {
                const { routes } = config;

                routes.forEach((routeInfo) => {
                    const middlewaresForRoute = middlewareContext.getMiddlewaresForRoute(routeInfo.path, routeInfo.method);
                    middlewaresForRoute.forEach((middleware) => {
                        middlewareContext.addModuleMiddlewares(module.name, [{
                            middleware,
                            routeInfo
                        }]);
                    });
                });
            });   
        }
    }
}