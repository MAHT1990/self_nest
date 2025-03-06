// 예제 모듈 
import { Module } from "../src/decorators/module.decorator";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";


@Module({
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
