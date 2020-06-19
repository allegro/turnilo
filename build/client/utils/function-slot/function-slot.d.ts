export interface FunctionSlot<T> {
    (...args: any[]): T;
    fill?: (fn: (...args: any[]) => T) => void;
    clear?: () => void;
}
export declare function createFunctionSlot<T>(): FunctionSlot<T>;
