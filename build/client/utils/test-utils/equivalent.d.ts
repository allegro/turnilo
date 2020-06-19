import * as Chai from "chai";
export default function (chai: typeof Chai): void;
declare global {
    namespace Chai {
        interface Assertion {
            equivalent(other: unknown): Assertion;
        }
    }
}
