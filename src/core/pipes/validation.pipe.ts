import { PipeTransform, ArgumentMetadata } from "./pipe.interfaces";


/**
 * ValidationPipe Class
 * 
 * @description 유효성 검사 파이프
 */
export class ValidationPipe implements PipeTransform {
    private readonly options: any;

    constructor(options?: any) {
        this.options = options || {};
    }

    /**
     * 유효성 검사 여부 확인
     * 
     * @description 
     * 인자로 전달된 타입이 유효성 검사를 필요로 하는 타입인지 확인
     * (metadataKey: design:paramtypes 는 인자의 타입: 생성자)
     * 
     * @param metatype - 검사할 타입
     * @returns 유효성 검사 여부
     */
    private toValidate(metatype: any): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    transform(value: any, metadata: ArgumentMetadata): any {
        if (!metadata.metatype || this.toValidate(metadata.metatype)) {
            return value;
        }

        if (value === null || value === undefined) {
            if (this.options.optional) return value;
            throw new Error(`${metadata.data} 필드가 필수값입니다.`);
        }

        if (typeof value !== 'object' && metadata.metatype === Object) {
            throw new Error(`${metadata.data} 필드가 객체여야 합니다.`);
        }

        return value;
    }
}