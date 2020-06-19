import { ExpressionJS } from "plywood";
import { Measure, MeasureJS } from "./measure";
export declare class MeasureFixtures {
    static wikiCountJS(): MeasureJS;
    static previousWikiCountJS(): MeasureJS;
    static deltaWikiCountJS(): MeasureJS;
    static wikiCount(): Measure;
    static wikiUniqueUsersJS(): MeasureJS;
    static wikiUniqueUsers(): Measure;
    static twitterCount(): Measure;
    static noTransformationMeasure(): Measure;
    static percentOfParentMeasure(): Measure;
    static percentOfTotalMeasure(): Measure;
    static applyWithNoTransformation(): ExpressionJS;
    static applyWithTransformationAtRootLevel(): ExpressionJS;
    static applyWithTransformationAtLevel(level: number): ExpressionJS;
}
