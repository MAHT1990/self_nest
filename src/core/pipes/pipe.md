# 🚀 파이프 구현 가이드

## 🔍 1. 핵심 구현 포인트

`PipeTransform` 인터페이스: 모든 파이프의 기본 구현체
- 입력값을 원하는 형태로 변환하거나 유효성을 검사하는 메서드 제공
- `transform()` 메서드를 통해 파라미터 처리 로직 구현

`Param` 데코레이터: 매개변수 정보 추출
- HTTP 요청에서 특정 파라미터 추출 (@Param, @Query)
- 메타데이터를 통해 파라미터 정보 저장

`UsePipes` 데코레이터: 변환 로직 적용
- 컨트롤러나 핸들러에 파이프 적용
- 여러 파이프를 체인으로 구성 가능

라우팅 처리: 
- 컨트롤러 메서드 실행 전 파이프 자동 적용
- 요청-파이프-컨트롤러 파이프라인 구성

## 🏗️ 2. 핵심 컴포넌트

### 🔄 인터페이스 계층

- **PipeTransform**: transform 메서드 정의
  - `transform(value: any, metadata: ArgumentMetadata)`
- **ArgumentMetadata**: 파라미터 메타데이터 구조
  - `{ type, metatype, data }`

### 🧩 데코레이터 계층

- **파라미터 데코레이터**: 메타데이터 등록
  - 요청 데이터 위치와 타입 지정
- **파이프 적용 데코레이터**: 변환 로직 연결
  - 단일/다중 파이프 적용 지원

### ⚙️ 파이프 구현체

- **ParseIntPipe**: 문자열을 정수로 변환
  - 숫자가 아닌 입력 검증 및 변환
- **ValidationPipe**: 객체 유효성 검사
  - DTO 스키마 기반 데이터 검증

### 🛣️ 라우팅 시스템

- **메타데이터 기반 라우트 추출**
  - 데코레이터로 등록된 정보 활용
- **파이프 적용 및 매개변수 변환**
  - 컨트롤러 메서드 호출 전 파이프 실행

## 🔄 3. 동작 프로세스

1. **요청 수신** → **라우트 매핑** → **매개변수 추출**
2. **파이프 검색** → **변환 로직 적용** → **유효성 검사**
3. **변환된 값으로 컨트롤러 메서드 호출** → **응답 반환**

## 📝 4. 구현 예시

```typescript
// ParseIntPipe 예시
class ParseIntPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new Error(`${value}는 숫자로 변환할 수 없습니다.`);
    }
    return val;
  }
}

// 컨트롤러에서 사용
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.usersService.findOne(id);
}
```