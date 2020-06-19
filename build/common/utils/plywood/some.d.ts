import { Expression } from "plywood";
import { Unary } from "../functional/functional";
export default function some(ex: Expression, predicate: Unary<Expression, boolean>): boolean;
