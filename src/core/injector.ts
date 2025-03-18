// 의존성 주입 
import { Container } from "./container";
import { Type } from "./interfaces/type.interfaces";
import { METADATA_KEY } from "../constants/shared.constants";


/**
 * 의존성 주입 관리자
 * 모듈 인스턴스, 프로바이더 인스턴스, 컨트롤러 인스턴스를 생성하고 주입합니다.
 * 
 * @param {Container} container - 의존성 주입 컨테이너
 * 
 * @description
 * entryModule 에서 시작하여 모든 모듈, 프로바이더, 컨트롤러를 생성하고 
 * container 에 주입합니다.
 * 
 * @example
 * const injector = new Injector(container);
 * injector.createInstances(entryModule);
 */
export class Injector {
    constructor(private readonly container: Container) {}

    /* 모든 instance 생성 */
    createInstances(entryModule: Type<any>): void {
        this.createModuleInstance(entryModule);
    }

    private createModuleInstance(module: Type<any>): void {
        /* module instance 생성 => container 에 저장 */
        this.container.getInstance(module);

        /* provider instance 생성 => container 에 저장 */
        const providers = this.container.getProviders(module);
        providers.forEach(provider => {
            this.container.getInstance(provider);
        });

        /* controller instance 생성 => container 에 저장 */
        const controllers = this.container.getControllers(module);
        controllers.forEach(controller => {
            this.container.getInstance(controller);
        });

        /* 재귀적으로 모듈 주입 */
        const metadata = Reflect.getMetadata(METADATA_KEY.MODULE, module) || {};
        if (metadata.imports) {
            metadata.imports.forEach((importedModule: Type<any>) => {
                this.createModuleInstance(importedModule);
            });
        }
    }
}