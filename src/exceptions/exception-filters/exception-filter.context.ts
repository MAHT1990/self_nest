import { Type } from "../../core/interfaces/type.interfaces";
import { ArgumentsHost } from "../../core/interfaces/arguments-host.interface";
import { ExceptionFilter, ExceptionFilterClass } from "./exception-filter.interfaces";
import { EXCEPTION_METADATA_KEY } from "../../constants/exception.constants";
import { HttpException } from "../http-exception";

/**
 * 예외 필터 컨텍스트
 * - 예외 필터 적용 시 필요한 정보를 저장하고 관리
 */
export class ExceptionFilterContext {
    private static instance: ExceptionFilterContext;
    private globalFilters: ExceptionFilter[] = [];

    /**
     * 싱글톤 인스턴스 반환
     */
    public static getInstance(): ExceptionFilterContext {
        if (!ExceptionFilterContext.instance) {
            ExceptionFilterContext.instance = new ExceptionFilterContext();
        }

        return ExceptionFilterContext.instance;
    }

    /**
     * 전역 예외 필터 추가
     */
    public addGlobalFilter(filter: ExceptionFilter): void {
        this.globalFilters.push(filter);
    }

    /**
     * 지정된 예외에 맞는 filter 검색
     */
    public getFilterForException(
        exception: any,
        filters: ExceptionFilter[]
    ): ExceptionFilter | null {
        for (const filter of filters) {
            const exceptionTypes = this.getExceptionTypesFromFilter(filter);

            if (exceptionTypes.length === 0 || this.canHandleException(exceptionTypes, exception)) {
                return filter;
            }
        }

        return null;
    }

    /**
     * 예외 필터에서 처리할 수 있는 예외 타입 추출
     */
    private getExceptionTypesFromFilter(
        filter: ExceptionFilter
    ): Type<any>[] {
        const filterStatic = filter.constructor as ExceptionFilterClass;
        return Reflect.getMetadata(EXCEPTION_METADATA_KEY.EXCEPTIONS, filterStatic) || [];
    }

    /**
     * 필터가 특정 에외를 처리할 수 있는지 확인
     */
    private canHandleException(
        types: Type<any>[],
        exception: any
    ): boolean {
        const hasHttpExceptionsHandler = types.some(type => type === HttpException);
        const isHttpException = exception instanceof HttpException;

        if (hasHttpExceptionsHandler && isHttpException) {
            return true;
        }

        return types.some(type => exception instanceof type);
    }
    
    /**
     * 예외 처리를 위한 Handler 생성
     */
    public createExceptionHandler(
        instance: object,
        methodName: string
    ): (exception: any, host: ArgumentsHost) => any {
        return (exception: any, host: ArgumentsHost) => {
            /* 메서드 레벨 필터 조회 */
            const methodFilters = this.getMethodFilters(instance, methodName);

            /* Class Level Filter 조회 */
            const classFilters = this.getClassFilters(instance.constructor);
            
            /* 모든 필터 결합 */
            const allFilters = [ ...classFilters, ...methodFilters, ...this.globalFilters ];

            /* 예외 처리 가능 필터 검색 */
            const filter = this.getFilterForException(exception, allFilters);

            if (filter) {
                return filter.catch(exception, host);
            }

            /* 예외 처리 불가능 시 예외 재발생 */
            throw exception;
        };
    }

    /**
     * 메서드 레벨 필터 조회
     */
    private getMethodFilters(
        instance: object,
        methodName: string
    ): ExceptionFilter[] {
        const method = instance[methodName as keyof typeof instance];
        const filters: Array<ExceptionFilterClass | ExceptionFilter> = 
            Reflect.getMetadata(EXCEPTION_METADATA_KEY.FILTERS, method) || [];
        
        return this.createFilterInstances(filters);
    }

    /**
     * Class Level Filter 조회
     */
    private getClassFilters(
        target: object
    ): ExceptionFilter[] {
        const filters: Array<ExceptionFilterClass | ExceptionFilter> = 
            Reflect.getMetadata(EXCEPTION_METADATA_KEY.FILTERS, target) || [];

        return this.createFilterInstances(filters);
    }

    /**
     * 필터 인스턴스 생성
     */
    private createFilterInstances(
        filters: Array<ExceptionFilterClass | ExceptionFilter>
    ): ExceptionFilter[] {
        return filters.map(filter => {
            if (filter instanceof Function && !(filter as unknown as ExceptionFilter).catch) {
                return new (filter as ExceptionFilterClass)();
            }

            return filter as ExceptionFilter;
        });
    }
}