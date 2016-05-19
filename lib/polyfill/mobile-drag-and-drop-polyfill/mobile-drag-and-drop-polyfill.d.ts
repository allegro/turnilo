declare module MobileDragAndDropPolyfill {
    interface Config {
        log?: (...args: any[]) => void;
        dragImageClass?: string;
        scrollThreshold?: number;
        scrollVelocity?: number;
        debug?: boolean;
    }
    var Initialize: (config?: Config) => void;
}
