// HTTP 어댑터

import * as http from "http";
import { HttpAdapter } from "../core/interfaces";


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
                const routeKey = `${method} ${path}`;
                const handler = this.app.routes.get(routeKey);

                if (handler) {
                    try {
                        const jsonBody = body ? JSON.parse(body) : {};
                        const result = handler(jsonBody);

                        /* response */
                        res.setHeader("Content-Type", "application/json");
                        res.statusCode = 200;
                        res.end(JSON.stringify(result || { message: "success" }));
                    } catch (error) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ message: (error as Error).message }));
                    }
                } else {
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
