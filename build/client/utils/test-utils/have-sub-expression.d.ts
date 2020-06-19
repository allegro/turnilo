import * as Chai from "chai";
import { Expression } from "plywood";
export default function (chai: typeof Chai): void;
declare global {
    namespace Chai {
        interface Assertion {
            haveSubExpression(exp: Expression): Assertion;
        }
    }
}
