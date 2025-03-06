// 애플리케이션 시작점 

import "reflect-metadata";
import { NestFactory } from "../src/core/factory";
import { AppModule } from "./app.module";


async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        abortOnError: false,
        autoFlushLogs: true,
    });
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    })
}

bootstrap();
