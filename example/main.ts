// 애플리케이션 시작점 
import "reflect-metadata";
import { NestFactory } from "../src/core/factory";
import { AppModule } from "./app.module";
import { ValidationPipe } from "../src/core/pipes/validation.pipe";


async function bootstrap() {
    /* 애플리케이션 생성 */
    const app = await NestFactory.create(AppModule, {
        abortOnError: false,
        autoFlushLogs: true,
    });

    /* Global Pipe 설정 */
    NestFactory.useGlobalPipes(new ValidationPipe({ optional: true }));

    /* 서버 실행 */
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    })
}

bootstrap();
