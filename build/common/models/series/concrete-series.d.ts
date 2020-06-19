import { ApplyExpression, Datum, Expression } from "plywood";
import { Unary } from "../../utils/functional/functional";
import { Measure } from "../measure/measure";
import { TimeShiftEnv } from "../time-shift/time-shift-env";
import { Series } from "./series";
export declare enum SeriesDerivation {
    CURRENT = "",
    PREVIOUS = "_previous__",
    DELTA = "_delta__"
}
export declare abstract class ConcreteSeries<T extends Series = Series> {
    readonly definition: T;
    readonly measure: Measure;
    constructor(definition: T, measure: Measure);
    equals(other: ConcreteSeries): boolean;
    reactKey(derivation?: SeriesDerivation): string;
    protected abstract applyExpression(expression: Expression, name: string, nestingLevel: number): ApplyExpression;
    plywoodKey(period?: SeriesDerivation): string;
    plywoodExpression(nestingLevel: number, timeShiftEnv: TimeShiftEnv): Expression;
    private filterMainRefs;
    selectValue(datum: Datum, period?: SeriesDerivation): number;
    formatter(): Unary<number, string>;
    formatValue(datum: Datum, period?: SeriesDerivation): string;
    title(derivation?: SeriesDerivation): string;
}
export declare function titleWithDerivation({ title }: Measure, derivation: SeriesDerivation): string;
export declare function getNameWithDerivation(reference: string, derivation: SeriesDerivation): string;
