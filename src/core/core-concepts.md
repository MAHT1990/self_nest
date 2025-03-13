# Core 모듈 작동 원리

본 문서는 self_nest 프레임워크의 핵심 모듈들의 작동 원리와 흐름을 설명합니다.

## 애플리케이션 생성 흐름
```mermaid
flowchart TD
    Main["main.ts<br>(bootstrap)"] --> NF["NestFactory.create()"]
    NF --> Container["Container 생성"]
    NF --> MS["모듈 스캔<br>ModuleScanner.scan()"]
    NF --> Injector["의존성 주입<br>Injector.createInstances()"]
    NF --> App["Application 생성"]
    App --> RegisterRoutes["라우트 등록"]
    App --> Listen["서버 시작"]
```

## IoC 컨테이너
```mermaid
flowchart TD
    Container["Container"] --> |저장| ModuleMap["모듈 맵"]
    Container --> |저장| InstanceMap["인스턴스 맵"]
    Container --> GetProviders["getProviders()"]
    Container --> GetControllers["getControllers()"]
    Container --> GetInstance["getInstance()"]
```

## 예외 처리 메커니즘
```mermaid
flowchart TD
    EZ["ExceptionsZone"] --> Run["run()"]
    EZ --> AsyncRun["asyncRun()"]
    CreateProxy["createProxy()"] --> CreateExceptionProxy["createExceptionProxy()"]
    CreateExceptionProxy --> CreateExceptionZone["createExceptionZone()"]
    CreateExceptionZone --> EZ
```

## 데코레이터 & 메타데이터
```mermaid
flowchart TD
    Module["@Module()"] --> |메타데이터 저장| ModuleMeta["MODULE 메타데이터"]
    Controller["@Controller()"] --> |메타데이터 저장| ControllerMeta["CONTROLLER <br>메타데이터"]
    Injectable["@Injectable()"] --> |메타데이터 저장| InjectableMeta["INJECTABLE <br>메타데이터"]
    Route["@Get(), @Post()..."] --> |메타데이터 저장| RouteMeta["ROUTE & METHOD <br>메타데이터"]
```

## HTTP 처리
```mermaid
flowchart TD
    ExpressAdapter["ExpressAdapter"] --> Listen["listen()"]
    RegisterRoutes["registerRoutes()"] --> |등록| Routes["라우트 맵"]
    Routes --> |요청 처리| Handler["래핑된 핸들러"]
    Handler --> |실행| ControllerMethod["컨트롤러 메소드"]
```

## 주요 패턴
- 모듈화
- 의존성 주입
- 데코레이터 패턴
- 팩토리 패턴
- 예외 처리
- 모듈 스캐닝 