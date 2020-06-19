import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
interface AddSeriesProps {
    appendMeasureSeries: Unary<Measure, void>;
    menuStage: Stage;
    essence: Essence;
}
export declare const AddSeries: React.SFC<AddSeriesProps>;
export {};
