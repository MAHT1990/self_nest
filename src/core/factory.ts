// NestFactory 구현 
import { Type } from "./interfaces/type.interfaces";
import { ApplicationOptions } from "./interfaces/applicationOptions.interface";
import { HttpAdapter } from "../adapters/http-adapter.interfaces";
import { ExpressAdapter } from "../adapters/http-adapter";
import { Container } from "./container";
import { ModuleScanner } from "./module-scanner";
import { Injector } from "./injector";
import { Application } from "./application";
import { ExceptionsZone } from "./exceptions-zone";
import { rethrow } from "../utils/shared.utils";
import { PipeTransform } from "./pipes/pipe.interfaces";
import { PipeContext } from "./pipes/pipe.context";


/**
 * NestFactory 클래스는 애플리케이션을 생성하고 구성하는 역할을 합니다.
 * 이 클래스는
 * - 애플리케이션의 기본 설정, 라우트 등록, 예외 처리 등을 관리합니다.
 * - 싱글톤 패턴을 적용하여 애플리케이션 인스턴스를 생성하고 관리합니다.
 * - 애플리케이션의 생성과 구성을 담당하며, 애플리케이션의 라이프사이클을 관리합니다.
 * 
 * @member abortOnError - 예외 발생 시 즉시 종료 여부
 * @member autoFlushLogs - 로그 자동 플러시 여부
 * 
 * @method create - 애플리케이션 인스턴스 생성
 * @method createNestInstance - Proxy로 wrap한 인스턴스 반환
 * @method createProxy - 예외처리를 위한 Proxy 생성
 * @method createExceptionProxy - 예외 처리 Proxy 핸들러 생성
 * @method createExceptionZone - 예외 처리 Zone 생성
 */
export class NestFactoryStatic {
    private abortOnError: boolean = true;
    private autoFlushLogs: boolean = true;


    /**
     * application 인스턴스 생성
     * 
     * @param entryModule 
     * @param options 
     * @returns 
     */
    public async create(
        entryModule: Type<any>,
        options: ApplicationOptions = {}
    ): Promise<Application> {
        /* option 처리 */
        this.abortOnError = options.abortOnError !== false;
        this.autoFlushLogs = options.autoFlushLogs !== false;

        /* 컨테이너 생성 */
        const container = new Container();

        /* Http Adapter 주입 */
        const httpAdapter = new ExpressAdapter();
        container.setHttpAdapter(httpAdapter);

        /* ModuleScanner 생성 */
        const moduleScanner = new ModuleScanner(container);

        /* Injector 생성 */
        const injector = new Injector(container);

        /* Application init */
        const tearDown = this.abortOnError ? rethrow : undefined;

        await ExceptionsZone.asyncRun(async () => {
            /* 모듈 스캐닝 => entryModule Scan => container 등록 */
            moduleScanner.scan(entryModule);

            /* Instance 생성 => Scan된 module 관련 인스턴스 생성 => container 등록 */
            injector.createInstances(entryModule);
        }, tearDown, this.autoFlushLogs);

        /* Application 생성 && 라우트 등록 */
        const app = new Application(container, httpAdapter, options);
        app.registerRoutes();

        return this.createNestInstance(app);
    }


    /**
     * 전역 파이프 등록
     * 
     * @param pipes 
     */
    public useGlobalPipes(
        ...pipes: PipeTransform[]
    ): void {
        const pipeContext = PipeContext.getInstance();
        pipes.forEach(pipe => pipeContext.addGlobalPipe(pipe));
    }


    /** Proxy가 wrap한 인스턴스 반환 
     * @see createProxy - Proxy 생성
     * @memberof create - 애플리케이션 인스턴스 생성
    */
    private createNestInstance<T>(instance: T): T {
        return this.createProxy(instance);
    }


    /** 예외처리를 위한 Proxy 생성 
     * @see createExceptionProxy - 예외 처리 Proxy 핸들러 생성
     * @memberof createNestInstance - Proxy가 wrap한 인스턴스 반환
    */
    private createProxy(target: any) {
        const proxy = this.createExceptionProxy();
        return new Proxy(target, {
            get: proxy,
            set: proxy,
        });
    }


    /** 예외 처리 Proxy 핸들러 생성 
     * @see createExceptionZone - 예외 처리 Zone 생성
     * @memberof createProxy - 예외 처리 Proxy 핸들러 생성
    */
    private createExceptionProxy() {
        return (receiver: Record<string, any>, prop: string) => {
            if (!(prop in receiver)) {
                return;
            }
            if (typeof receiver[prop] === "function") {
                return this.createExceptionZone(receiver, prop);
            }
            return receiver[prop];
        }
    }


    /** 예외 처리 Zone 생성 
     * @memberof createExceptionProxy - 예외 처리 Proxy 핸들러 생성
    */
    private createExceptionZone(
        receiver: Record<string, any>, 
        prop: string
    ): Function {
        const teardown = this.abortOnError === false ? rethrow : undefined;
        return (...args: unknown[]) => {
            let result: unknown;
            ExceptionsZone.run(() => {
                result = receiver[prop](...args);
            }, teardown, this.autoFlushLogs);
            return result;
        };
    }
}

/* Singleton 패턴 적용 */
export const NestFactory = new NestFactoryStatic();