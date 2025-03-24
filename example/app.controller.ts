import { Controller } from "../src/decorators/controller.decorator";
import { UseFilters } from "../src/decorators/use-filters.decorator";
import { Body, Param } from "../src/decorators/param.decorator";
import { Get, Post } from "../src/decorators/route.decorator";
import { AppService } from "./app.service";
import { ParseIntPipe } from "../src/core/pipes/parse-int.pipe";
import { ValidationPipe } from "../src/core/pipes/validation.pipe";
import { LoggingExceptionFilter } from "../src/exceptions/exception-filters/logging-exception.filter";


@Controller()
@UseFilters(LoggingExceptionFilter)
export class AppController {
    constructor(
        private readonly appService: AppService
    ) {}

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