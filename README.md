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
│   │   ├── injector.ts         - 의존성 주입
│   │   └── pipes/              - 파이프 관련 구현체
│   │       ├── pipe.md         - 파이프 설계 문서
│   │       └── ...
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

# Mermaid Diagrams

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

# 주요 패턴
- 모듈화
- 의존성 주입
- 데코레이터 패턴
- 팩토리 패턴
- 예외 처리
- 모듈 스캐닝

# 주요 문서
## 📋 [파이프(Pipe) 구현 가이드](src/core/pipes/pipe.md)
파이프는 데이터 변환과 유효성 검증을 위한 핵심 기능입니다. 입력 데이터를 필요한 형식으로 변환하거나, 잘못된 데이터를 필터링하는 역할을 합니다.

주요 특징:
- 요청 데이터 변환 (예: 문자열 → 숫자)
- 데이터 유효성 검증
- 컨트롤러 메서드 실행 전 자동 적용
- 파이프라인 구성으로 체인 처리 가능













