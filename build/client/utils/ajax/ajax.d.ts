import { Executor } from "plywood";
import { DataCube } from "../../../common/models/data-cube/data-cube";
export interface AjaxOptions {
    method: "GET" | "POST";
    url: string;
    timeout: number;
    data?: any;
}
export declare class Ajax {
    static version: string;
    static settingsVersionGetter: () => number;
    static onUpdate: () => void;
    static query<T>({ data, url, timeout, method }: AjaxOptions): Promise<T>;
    static queryUrlExecutorFactory({ name, cluster }: DataCube): Executor;
}
