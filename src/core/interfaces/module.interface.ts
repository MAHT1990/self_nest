import { MiddlewareConsumer } from "../middlewares/middleware.consumer";

/**
 * Module Interface
 */
export interface NestModule {
    configure(consumer: MiddlewareConsumer): void;
}