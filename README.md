# self_nest
nest 코드를 이해하고자 핵심 원리를 기반으로 한 self nest 만들기

# Directory Structure
```
self_nest/
├── src/
│   ├── core/
│   │   ├── interfaces/         - 핵심 인터페이스
│   │   │   ├── ...             - 인터페이스 파일들
│   │   ├── factory.ts          - NestFactory 구현
│   │   ├── application.ts      - 애플리케이션 클래스
│   │   ├── container.ts        - IoC 컨테이너
│   │   ├── exceptions-zone.ts  - 예외 처리 영역
│   │   ├── module-scanner.ts   - 모듈 스캐닝
│   │   ├── injector.ts         - 의존성 주입
│   │   ├── pipes/              - 파이프 관련 구현체
│   │   │   ├── pipe.context.ts - 파이프 컨텍스트
│   │   │   ├── pipe.interface.ts - 파이프 인터페이스
│   │   │   └── ...
│   │   └── guards/              - 가드 관련 구현체
│   │       ├── guard.context.ts - 가드 컨텍스트
│   │       ├── guard.interface.ts - 가드 인터페이스
│   │       └── ...
│   ├── decorators/
│   │   ├── module.decorator.ts - 모듈 데코레이터
│   │   ├── controller.decorator.ts - 컨트롤러 데코레이터
│   │   ├── injectable.decorator.ts - 프로바이더 데코레이터
│   │   ├── route.decorator.ts  - 라우트 데코레이터
│   │   ├── catch.decorator.ts  - 예외 필터 데코레이터
│   │   └── use-filters.decorator.ts - 필터 적용 데코레이터
│   ├── adapters/
│   │   └── http-adapter.ts     - HTTP 어댑터
│   ├── constants/
│   │   └── shared.constants.ts - 공통 상수
│   ├── exceptions/             - 예외 관련 클래스
│   │   ├── http-exception.ts   - HTTP 예외 클래스
│   │   └── exception-filters/  - 예외 필터 관련 구현체
│   │       ├── exception-filter.context.ts - 필터 컨텍스트
│   │       ├── exception-filter.interfaces.ts - 필터 인터페이스
│   │       └── base-exception-filter.ts - 기본 예외 필터
│   └── utils/
│       └── shared.utils.ts     - 유틸리티 함수
├── example/
│   ├── app.module.ts           - 예제 모듈
│   ├── app.controller.ts       - 예제 컨트롤러
│   ├── app.service.ts          - 예제 서비스
│   └── main.ts                 - 애플리케이션 시작점
```

# 주요 문서
## 📖 [Core 모듈 작동 원리](docs/core-concepts.md)
Core 모듈의 작동 원리, 흐름도 및 주요 패턴에 대한 설명을 제공합니다.

## 📋 [파이프(Pipe) 구현 가이드](docs/pipe.md)
파이프는 데이터 변환과 유효성 검증을 위한 핵심 기능입니다. 입력 데이터를 필요한 형식으로 변환하거나, 잘못된 데이터를 필터링하는 역할을 합니다.

주요 특징:
- 요청 데이터 변환 (예: 문자열 → 숫자)
- 데이터 유효성 검증
- 컨트롤러 메서드 실행 전 자동 적용
- 파이프라인 구성으로 체인 처리 가능

## 🛡️ [가드(Guard) 구현 가이드](docs/guard.md)
가드는 특정 요청이 라우트 핸들러에 의해 처리될지 여부를 결정하는 역할을 합니다. 주로 인증, 권한 부여, 역할 기반 접근 제어에 사용됩니다.

주요 특징:
- 요청 처리 전 실행되는 인터셉터
- 인증 및 권한 부여 로직 구현
- 컨트롤러 또는 메서드 수준 적용 가능
- 체인으로 구성하여 복잡한 권한 시나리오 구현

## 🔄 [미들웨어(Middleware) 구현 가이드](docs/middleware.md)
미들웨어는 요청-응답 사이클 내에서 특정 로직을 실행하는 함수입니다. 라우트 핸들러 전에 실행되어 요청 전처리 또는 응답 후처리를 담당합니다.

주요 특징:
- 요청/응답 객체에 직접 접근 가능
- 다음 미들웨어 함수 호출 제어
- 전역, 모듈별, 또는 특정 경로에 적용 가능
- 로깅, 인증, CORS 등 공통 기능 구현에 적합

## 🚨 [예외 필터(Exception Filter) 구현 가이드](docs/exception-filter.md)
예외 필터는 애플리케이션에서 발생하는 예외를 처리하고 클라이언트에게 적절한 응답을 반환하는 역할을 합니다. 미처리된 예외를 캐치하여 일관된 오류 응답 형식을 제공합니다.

주요 특징:
- 애플리케이션 예외의 중앙 집중식 처리
- 예외 타입별 맞춤형 응답 생성
- 전역 또는 컨트롤러/메서드 수준 적용 가능
- HTTP 상태 코드 및 응답 본문 커스터마이징
- 로깅 및 모니터링과 통합 용이