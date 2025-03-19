// 예제 서비스 
import { Injectable } from "../src/decorators/injectable.decorator";


@Injectable()
export class AppService {
    getHello(): string {
        return "Hello World";
    }
}