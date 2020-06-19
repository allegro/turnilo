import { Unary } from "../functional/functional";
export declare function timeout(ms: number): Promise<void>;
export declare class Deferred<T> {
    readonly promise: Promise<T>;
    resolve: Unary<T, void>;
    reject: Unary<unknown, void>;
    constructor();
}
