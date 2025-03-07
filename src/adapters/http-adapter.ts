// HTTP 어댑터

import * as http from "http";
import { HttpAdapter } from "../core/interfaces";


/**
 * - HttpAdapter 인터페이스 구현
 * - Express 유사 라우팅 시스템 구현
 * - Node.js 내장 http 모듈 활용
 * - 요청/응답 처리 파이프 라인
 * 
 * @description
 * 1. 초기화 프로세스
 * - app 객체 생성: 라우팅 맵, 미들웨어 배열 초기화
 *      - routes: 메서드별 라우트 저장
 *      - middlewares: 미들웨어 저장
 * - Node.js `http.createServer` 로 HTTP 서버 인스턴스 생성
 *      - 요청 처리 핸들러 정의
 * 
 * 2. 요청 처리 파이프라인
 * - URL과 Http Method Parsing
 * - Body 스트림 수집
 * - 라우트 매핑
 * - 해당 handler 실행 및 결과 반환
 * - Error Handling(404, 500)
 * 
 * 3. 라우팅 시스템
 * - Http Method 별 라우팅 메소드 제공(get, post, put, delete, patch)
 * - 각 route는 `${method} ${path}` 형식으로 Map 객체에 저장
 * - 함수형 핸들러를 route에 매핑
 * 
 * 4. 서버 실행
 * - `listen` 메소드 호출
 * - 콜백 함수로 후작업 처리
 */
export class ExpressAdapter implements HttpAdapter {
    private app: any;
    private server: http.Server;

    constructor() {
        this.app = {
            routes: new Map(),
            middlewares: [],
        };

        this.server = http.createServer((req, res) => {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            const method = req.method?.toLowerCase();
            const path = url.pathname;

            /* body parsing */
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });

            req.on("end", () => {
                /* route mapping */
                const routeKey = `${method} ${path}`;

                /* handler */
                const handler = this.app.routes.get(routeKey);

                if (handler) {
                    try {
                        /* body parsing */
                        const jsonBody = body ? JSON.parse(body) : {};
                        const result = handler(jsonBody);

                        /* response */
                        res.setHeader("Content-Type", "application/json");
                        res.statusCode = 200;
                        res.end(JSON.stringify(result || { message: "success" }));
                    } catch (error) {
                        /* internal server error */
                        res.statusCode = 500;
                        res.end(JSON.stringify({ message: (error as Error).message }));
                    }
                } else {
                    /* not found */
                    res.statusCode = 404;
                    res.end(JSON.stringify({ message: "Not Found" }));
                }
            });
        });
    }

    listen(port: number, callback?: () => void): void {
        this.server.listen(port, callback);
    }

    get(path: string, handler: Function): void {
        this.app.routes.set(`get ${path}`, handler);
    }

    post(path: string, handler: Function): void {
        this.app.routes.set(`post ${path}`, handler);
    }
    
    put(path: string, handler: Function): void {
        this.app.routes.set(`put ${path}`, handler);
    }

    delete(path: string, handler: Function): void {
        this.app.routes.set(`delete ${path}`, handler);
    }

    patch(path: string, handler: Function): void {
        this.app.routes.set(`patch ${path}`, handler);
    }
}