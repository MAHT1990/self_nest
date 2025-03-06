// IoC 컨테이너 
import { Type } from "./interfaces";
import { METADATA_KEY } from "../constants/shared.constants";


/**
 * 의존성 주입 컨테이너
 * 모듈, 프로바이더, 컨트롤러 인스턴스를 관리하고 주입합니다.
 * 
 * @member {Map<Type<any>, Map<string, any>>} moduleMap - 모듈 맵
 * @member {Map<Type<any>, any>} instanceMap - 인스턴스 맵
 * @member {any} httpAdapter - HTTP 어댑터
 * 
 * @description
 * 모듈, 프로바이더, 컨트롤러 인스턴스를 관리하고 주입합니다.
 * 
 * @example
 * const container = new Container();
 * container.registerModule(Module);
 */
export class Container {
    private moduleMap: Map<Type<any>, Map<string, any>> = new Map();
    private instanceMap: Map<Type<any>, any> = new Map();
    private httpAdapter: any = null;

    registerModule(module: Type<any>): void {
        if (!this.moduleMap.has(module)) {
            const metadata = Reflect.getMetadata(METADATA_KEY.MODULE, module) || {};
            const providers = new Map();

            if (metadata.providers) {
                metadata.providers.forEach((provider: Type<any>) => {
                    providers.set(provider.name, provider);
                });
            }

            this.moduleMap.set(module, providers);
        }
    }

    getProviders(module: Type<any>): Map<string, Type<any>> {
        return this.moduleMap.get(module) || new Map();
    }

    getControllers(module: Type<any>): Type<any>[] {
        const metadata = Reflect.getMetadata(METADATA_KEY.MODULE, module) || {};
        return metadata.controllers || [];
    }

    getModules(): Map<Type<any>, Map<string, any>> {
        return this.moduleMap;
    }

    getInstance<T>(type: Type<T>): T {
        if (this.instanceMap.has(type)) {
            return this.instanceMap.get(type);
        }

        /* TODO: 의존성 주입 생략 */
        const instance = new type();
        this.instanceMap.set(type, instance);
        return instance;
    }

    /* 직접 인스턴스 설정 */
    setInstance<T>(type: Type<T>, instance: T): void {
        this.instanceMap.set(type, instance);
    }

    /* Http Adapter 설정 */
    setHttpAdapter(adapter: any): void {
        this.httpAdapter = adapter;
    }

    getHttpAdapter(): any {
        return this.httpAdapter;
    }
}
