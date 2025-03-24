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
- `ArgumentsHost` 인터페이스 구현
- `@Catch()` 데코레이터 사용
- `@UseFilters()` 데코레이터 사용
- `ExceptionFilterContext` 클래스 사용



## 2. Exception Filter 등록 및 적용 로직

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
