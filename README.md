# self_nest
nest 코드를 이해하고자 핵심 원리를 기반으로 한 self nest 만들기

# Directory Structure
```
self_nest/
├── src/
│   ├── core/
│   │   ├── interfaces.ts       - 핵심 인터페이스
│   │   ├── factory.ts          - NestFactory 구현
│   │   ├── application.ts      - 애플리케이션 클래스
│   │   ├── container.ts        - IoC 컨테이너
│   │   ├── exceptions-zone.ts  - 예외 처리 영역
│   │   ├── module-scanner.ts   - 모듈 스캐닝
│   │   └── injector.ts         - 의존성 주입
│   ├── decorators/
│   │   ├── module.decorator.ts - 모듈 데코레이터
│   │   ├── controller.decorator.ts - 컨트롤러 데코레이터
│   │   ├── injectable.decorator.ts - 프로바이더 데코레이터
│   │   └── route.decorator.ts  - 라우트 데코레이터
│   ├── adapters/
│   │   └── http-adapter.ts     - HTTP 어댑터
│   ├── constants/
│   │   └── shared.constants.ts - 공통 상수
│   └── utils/
│       └── shared.utils.ts     - 유틸리티 함수
├── example/
│   ├── app.module.ts           - 예제 모듈
│   ├── app.controller.ts       - 예제 컨트롤러
│   ├── app.service.ts          - 예제 서비스
│   └── main.ts                 - 애플리케이션 시작점
```

# Mermaid Diagram
```mermaid
flowchart TD
    subgraph "애플리케이션 생성 흐름"
        Main["main.ts\n(bootstrap)"] --> NF["NestFactory.create()"]
        NF --> Container["Container 생성"]
        NF --> MS["ModuleScanner.scan()"]
        NF --> Injector["Injector.createInstances()"]
        NF --> App["Application 생성"]
        App --> RegisterRoutes["라우트 등록"]
        App --> Listen["서버 시작"]
    end
    
    subgraph "IoC 컨테이너"
        Container --> |저장| ModuleMap["모듈 맵"]
        Container --> |저장| InstanceMap["인스턴스 맵"]
        Container --> GetProviders["getProviders()"]
        Container --> GetControllers["getControllers()"]
        Container --> GetInstance["getInstance()"]
    end
    
    subgraph "예외 처리 메커니즘"
        EZ["ExceptionsZone"] --> Run["run()"]
        EZ --> AsyncRun["asyncRun()"]
        CreateProxy["createProxy()"] --> CreateExceptionProxy["createExceptionProxy()"]
        CreateExceptionProxy --> CreateExceptionZone["createExceptionZone()"]
        CreateExceptionZone --> EZ
    end
    
    subgraph "데코레이터 & 메타데이터"
        Module["@Module()"] --> |메타데이터 저장| ModuleMeta["MODULE 메타데이터"]
        Controller["@Controller()"] --> |메타데이터 저장| ControllerMeta["CONTROLLER 메타데이터"]
        Injectable["@Injectable()"] --> |메타데이터 저장| InjectableMeta["INJECTABLE 메타데이터"]
        Route["@Get(), @Post()..."] --> |메타데이터 저장| RouteMeta["ROUTE & METHOD 메타데이터"]
    end
    
    subgraph "HTTP 처리"
        ExpressAdapter["ExpressAdapter"] --> Listen
        RegisterRoutes --> |등록| Routes["라우트 맵"]
        Routes --> |요청 처리| Handler["래핑된 핸들러"]
        Handler --> |실행| ControllerMethod["컨트롤러 메소드"]
    end
```

# 주요 패턴
- 모듈화
- 의존성 주입
- 데코레이터 패턴
- 팩토리 패턴
- 예외 처리
- 모듈 스캐닝













