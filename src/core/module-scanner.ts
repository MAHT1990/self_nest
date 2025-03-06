// 모듈 스캐닝 
import { Container } from "./container";
import { Type } from "./interfaces";
import { METADATA_KEY } from "../constants/shared.constants";


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
 */
export class ModuleScanner {
    constructor(private container: Container) {}

    /* Module, Dependency Scan */
    scan(entryModule: Type<any>): void {
        this.scanModule(entryModule);
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
}