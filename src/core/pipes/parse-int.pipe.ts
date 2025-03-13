import { PipeTransform, ArgumentMetadata } from "./pipe.interfaces";


/**
 * ParseIntPipe Class
 * 
 * @description 문자열을 정수로 변환하는 파이프
 */
export class ParseIntPipe implements PipeTransform<string, number> {
    transform(
        value: string,
        metadata: ArgumentMetadata
    ): number {
        const val = parseInt(value, 10);
        if (isNaN(val)) {
            throw new Error(`${metadata.data} 필드가 숫자여야 합니다.`);
        }
        return val;
    }
}