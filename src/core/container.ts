// IoC 컨테이너 
import { Type } from "./interfaces";
import { METADATA_KEY } from "../constants/shared.constants";


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

    getInstance<T>(type: Type<T>): T {
        if (this.instanceMap.has(type)) {
            return this.instanceMap.get(type);
        }

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
