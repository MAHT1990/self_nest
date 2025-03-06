// 예제 컨트롤러 
import { Controller } from "../src/decorators/controller.decorator";
import { Get } from "../src/decorators/route.decorator";
import { AppService } from "./app.service";


@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("/")
    getHello() {
        return { message: this.appService.getHello() };
    }

    @Get("/error")
    throwError() {
        throw new Error("This is a test error");
    }
}