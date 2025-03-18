/**
 * 클래스 타입 확장
 * T 타입의 생성자 타입을 나타냅니다.
 * 
 * @example
 * Type<UserService>는 UserService 클래스의 생성자 타입을 나타냅니다
 * const userServiceType: Type<UserService> = UserService;
 * 
 * 이제 이 타입을 사용하여 새로운 인스턴스를 생성할 수 있습니다
 * const userService = new userServiceType("John");
 */
export interface Type<T = any> extends Function {
    new (...args: any[]): T;
}