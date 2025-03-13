// 예제 컨트롤러 
import { Controller } from "../src/decorators/controller.decorator";
import { Body, Param } from "../src/decorators/param.decorator";
import { Get, Post } from "../src/decorators/route.decorator";
import { AppService } from "./app.service";
import { ParseIntPipe } from "../src/core/pipes/parse-int.pipe";
import { ValidationPipe } from "../src/core/pipes/validation.pipe";


@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get("/")
    getHello() {
        return { message: this.appService.getHello() };
    }

    @Get("/users/:id")
    getUserById(@Param("id", new ParseIntPipe()) id: number) {
        return { id, name: "사용자" + id };
    }

    @Post("/users")
    createUser(@Body(undefined, new ValidationPipe({ optional: true })) body: { name: string }) {
        return { message: "사용자 생성", user: body };
    }
}