import { Record } from "immutable";
import { Equalable } from "immutable-class";
export declare class ImmutableUtils {
    static setProperty(instance: any, path: string, newValue: any): any;
    static getProperty(instance: any, path: string): any;
    static change<T>(instance: T, propertyName: string, newValue: any): T;
    static addInArray<T>(instance: T, propertyName: string, newItem: any, index?: number): T;
}
export declare type ImmutableRecord<T> = Record<T> & Readonly<T>;
export declare function isEqualable(o: unknown): o is Equalable;
