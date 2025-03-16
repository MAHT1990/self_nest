// HTTP 예외 클래스 모음
// 다양한 HTTP 상태 코드에 해당하는 예외 클래스를 제공합니다.

/**
 * HTTP 예외의 기본 클래스
 * 모든 HTTP 관련 예외는 이 클래스를 상속받아 구현됩니다.
 */
export class HttpException extends Error {
  constructor(
    private readonly response: string | Record<string, any>,
    private readonly status: number
  ) {
    super(typeof response === 'string' ? response : JSON.stringify(response));
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 예외의 HTTP 상태 코드를 반환합니다.
   */
  getStatus(): number {
    return this.status;
  }

  /**
   * 예외의 응답 객체를 반환합니다.
   */
  getResponse(): string | Record<string, any> {
    return this.response;
  }
}

/**
 * 400 Bad Request
 * 잘못된 요청 형식, 유효하지 않은 요청 파라미터 등의 클라이언트 오류
 */
export class BadRequestException extends HttpException {
  constructor(
    response: string | Record<string, any> = '잘못된 요청입니다'
  ) {
    super(response, 400);
  }
}

/**
 * 401 Unauthorized
 * 인증되지 않은 요청에 대한 오류
 */
export class UnauthorizedException extends HttpException {
  constructor(
    response: string | Record<string, any> = '인증이 필요합니다'
  ) {
    super(response, 401);
  }
}

/**
 * 403 Forbidden
 * 권한이 없는 리소스에 접근 시도시 발생하는 오류
 */
export class ForbiddenException extends HttpException {
  constructor(
    response: string | Record<string, any> = '접근 권한이 없습니다'
  ) {
    super(response, 403);
  }
}

/**
 * 404 Not Found
 * 요청한 리소스를 찾을 수 없을 때 발생하는 오류
 */
export class NotFoundException extends HttpException {
  constructor(
    response: string | Record<string, any> = '요청한 리소스를 찾을 수 없습니다'
  ) {
    super(response, 404);
  }
}

/**
 * 409 Conflict
 * 리소스의 현재 상태와 충돌하는 요청 발생 시 오류
 */
export class ConflictException extends HttpException {
  constructor(
    response: string | Record<string, any> = '리소스 충돌이 발생했습니다'
  ) {
    super(response, 409);
  }
}

/**
 * 422 Unprocessable Entity
 * 요청은, 유효하나 서버가 처리할 수 없는 경우 발생하는 오류 (주로 유효성 검증 실패)
 */
export class UnprocessableEntityException extends HttpException {
  constructor(
    response: string | Record<string, any> = '요청을 처리할 수 없습니다'
  ) {
    super(response, 422);
  }
}

/**
 * 500 Internal Server Error
 * 서버 내부 오류
 */
export class InternalServerErrorException extends HttpException {
  constructor(
    response: string | Record<string, any> = '내부 서버 오류가 발생했습니다'
  ) {
    super(response, 500);
  }
}

/**
 * 503 Service Unavailable
 * 서비스를 일시적으로 사용할 수 없는 경우 발생하는 오류
 */
export class ServiceUnavailableException extends HttpException {
  constructor(
    response: string | Record<string, any> = '서비스를 일시적으로 사용할 수 없습니다'
  ) {
    super(response, 503);
  }
}

/**
 * 유효성 검증 오류 타입 정의
 * 파이프에서 사용되는 유효성 검증 오류를 위한 인터페이스
 */
export interface ValidationError {
  property: string;
  value?: any;
  constraints: Record<string, string>;
  children?: ValidationError[];
}

/**
 * 유효성 검증 예외 클래스
 * 유효성 검증 실패 시 발생하는 예외
 */
export class ValidationException extends Error {
  constructor(
    public readonly errors: ValidationError[],
    message: string = '유효성 검증에 실패했습니다'
  ) {
    super(message);
    this.name = 'ValidationException';
    Error.captureStackTrace(this, this.constructor);
  }
} 