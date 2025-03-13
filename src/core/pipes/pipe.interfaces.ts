/**
 * PipeTransform 인터페이스
 * 모든 파이프는 이 인터페이스를 구현해야 함
 * 
 * @see ArgumentMetadata
 */
export interface PipeTransform<T = any, R = any> {
    transform(value: T, metadata?: ArgumentMetadata): R;
}


/**
 * ArgumentMetadata 인터페이스
 * 인자 메타데이터를 정의하는 인터페이스
 */
export interface ArgumentMetadata {
    type: 'body' | 'query' | 'param' | 'custom';
    metatype?: any;
    data?: string;
}