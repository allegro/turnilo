import * as React from "react";
interface Teleporter {
    Source: typeof React.Component;
    Target: React.SFC<{}>;
}
export declare function createTeleporter(): Teleporter;
export {};
