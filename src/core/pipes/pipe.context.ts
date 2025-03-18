import { PipeTransform, ArgumentMetadata } from "./pipe.interfaces";


/**
 * PipeContext Class
 * 
 * @description 파이프 컨텍스트 관리
 */
export class PipeContext {
    private static instance: PipeContext;
    private globalPipes: PipeTransform[] =[];

    private constructor() {}

    /**
     * 싱글톤 인스턴스 반환
     * @returns PipeContext 인스턴스
     */
    static getInstance(): PipeContext {
        if (!PipeContext.instance) {
            PipeContext.instance = new PipeContext();
        }
        return PipeContext.instance;
    }

    /**
     * 전역 파이프 추가
     * @param pipe - 추가할 파이프
     */
    addGlobalPipe(
        pipe: PipeTransform<any, any>
    ): void {
        this.globalPipes.push(pipe);   
    }

    /**
     * 파이프 적용
     * @param value - 변환할 값
     * @param pipes - 적용할 파이프 목록
     * @param metadata - 인자 메타데이터
     */
    async applyPipes(
        value: any,
        pipes: PipeTransform[],
        metadata: ArgumentMetadata
    ): Promise<any> {
        let transformedValue = value;

        /* 전역 파이프 적용 */
        for (const pipe of this.globalPipes) {
            try {
                transformedValue = await this.applyPipe(pipe, transformedValue, metadata);
            } catch (error) {
                throw error;
            }
        }

        /* Route, Handler 파이프 적용 */
        for (const pipe of pipes) {
            try {
                transformedValue = await this.applyPipe(pipe, transformedValue, metadata);
            } catch (error) {
                throw error;
            }
        }

        return transformedValue;
    }

    /**
     * 파이프 적용
     * @param pipe - 적용할 파이프
     * @param value - 변환할 값
     * @param metadata - 인자 메타데이터
     */
    private async applyPipe(
        pipe: PipeTransform,
        value: any,
        metadata: ArgumentMetadata
    ): Promise<any> {
        const result = pipe.transform(value, metadata);
        return result instanceof Promise ? result : Promise.resolve(result);
    }
}