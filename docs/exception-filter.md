# Exception Filter

## Exception Filter 소개

Exception Filter는 예외 처리를 담당하는 필터입니다.

### Exception Filter 주요 특징
- 계층적 적용: 전역, 컨트롤러, 핸들러 레벨 순서로 적용
- 예외 필터링: `@Catch()` 데코레이터로 예외 필터링
- 커스텀 응답: 예외 처리 시 커스텀 응답 지원
- 예외 전파: 예외 처리 후 다음 필터로 전파 가능
- 컨텍스트 접근: ArgumentHost를 통해 컨텍스트 접근 가능


## 1. 핵심 구현 포인트
- `ExceptionFilter` 인터페이스 구현
  - `catch(exception: any, host: ArgumentsHost): void` 메서드를 통해 실제 예외 처리 로직 구현
  - `@Catch()` 데코레이터를 통해 타겟 예외 지정
- `ArgumentsHost` 인터페이스 구현
  - `switchToHttp()` 메서드를 통해 HTTP 컨텍스트로 변환
- `@UseFilters()` 데코레이터 사용
  - Class Level, Method Level, Global Level 적용 가능
- `ExceptionFilterContext` 클래스 사용
  - 예외 필터 등록 및 적용 로직 관리
  - 예외 필터 조회 및 적용 로직 관리



## 2. Exception Filter 등록 및 적용 로직
```mermaid
flowchart TD
    subgraph "1.Exception Filter 등록"
        A1[전역 필터 등록] -->|"NestFactory.useGlobalFilters()"| A2[ExceptionFilterContext에 추가]
        B1[컨트롤러 레벨 필터 등록] -->|"@UseFilters() 데코레이터"| B2[컨트롤러 메타데이터에 저장]
        C1[핸들러 레벨 필터 등록] -->|"@UseFilters() 데코레이터"| C2[메서드 메타데이터에 저장]
    end

    subgraph "2.Application 초기화"
        D1[Application 생성] --> D2[ExceptionFilterContext 초기화]
        D2 --> D3[BaseExceptionFilter 기본 등록]
        D3 --> D4[라우트 등록 단계에서 예외 처리 래핑]
    end

    subgraph "3.런타임 예외 처리"
        E1[예외 발생] --> E2[ExceptionZone에서 캐치]
        E2 --> E3["createExceptionHandler 호출"]
        E3 --> E4["필터 목록 수집"]
        E4 --> E5{예외 처리 가능 필터 존재?}
        E5 -->|YES| E6["필터.catch() 실행"]
        E5 -->|NO| E7["기본 예외 응답"]
    end

    A2 -.-> E4
    B2 -.-> E4
    C2 -.-> E4
```
### 1. Exception Filter 등록 로직
- 전역 필터 등록
    - `NestFactory.useGlobalFilters()` 메서드를 통해 전역 필터 등록
    - `ExceptionFilterContext`에 필터 추가
    - 기본적으로 `BaseExceptionFilter`가 등록됨.

- 컨트롤러 레벨 필터 등록
    - `@UseFilters()` 데코레이터를 통해 컨트롤러 레벨 필터 등록
    - 컨트롤러 메타데이터에 필터 정보 저장

- 핸들러 레벨 필터 등록
    - `@UseFilters()` 데코레이터를 통해 핸들러 레벨 필터 등록
    - 메서드 메타데이터에 필터 정보 저장
### 2. Application 초기화 로직
- ExceptionFilterContext 초기화
- Router 등록시 요청 핸들러에 예외처리 래핑
- `createExceptionZone` 메서드를 통해 예외 처리 래핑

### 3. 예외 처리 과정
- `ExceptionsZone` 에서 모든 예외 catch
- `ArgumentsHost` 객체 생성 => 컨텍스트 정보 제공
- `ExceptionFilterContext.createExceptionHandler()`를 통해 예외 처리 handler 생성

- `getMethodFilters()` 메서드를 통해 메서드 레벨 필터 조회
- `getClassFilters()` 메서드를 통해 클래스 레벨 필터 조회
- `globalFilters` 전역 필터 수집
- `getFilterForException()` 메서드를 통해 예외 타입에 맞는 필터 조회
- 예외 처리 가능 필터 존재 시 `catch()` 메서드 실행
- 미존재시, 예외 재발생 또는 기본 예외 응답 처리.


## 3. 동작 프로세스
```mermaid
flowchart TD
    HTTP["HTTP 요청"] --> Middleware["미들웨어 실행"]
    Middleware --> Guards["가드 실행"]
    Guards --> Pipes["파이프 실행"]
    Pipes --> Handler["컨트롤러 핸들러 실행"]
    
    Handler -->|성공| Response["HTTP 응답"]
    Handler -->|예외 발생| ExceptionCatch["예외 캐치"]
    
    ExceptionCatch --> GlobalFilters["전역 필터 실행"]
    GlobalFilters --> ControllerFilters["컨트롤러 레벨 필터 실행"]
    ControllerFilters --> HandlerFilters["핸들러 레벨 필터 실행"]
    HandlerFilters --> MatchFilter{"예외와 일치하는<br>필터 찾기"}
    
    MatchFilter -->|찾음| ExFilter["필터.catch() 실행"]
    MatchFilter -->|못찾음| Default["기본 예외 응답"]
    
    ExFilter --> CustomResponse["커스텀 응답"]
    Default --> DefaultResponse["기본 형식 응답"]
    
    CustomResponse --> Client["클라이언트"]
    DefaultResponse --> Client
```

## 4. 구현 예시
