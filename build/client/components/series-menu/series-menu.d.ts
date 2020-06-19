import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { Measures } from "../../../common/models/measure/measures";
import { SeriesList } from "../../../common/models/series-list/series-list";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import "./series-menu.scss";
interface SeriesMenuProps {
    saveSeries: Unary<Series, void>;
    measure: Measure;
    measures: Measures;
    seriesList: SeriesList;
    containerStage: Stage;
    onClose: Fn;
    initialSeries: Series;
    openOn: Element;
}
interface SeriesMenuState {
    series: Series;
    isValid: boolean;
}
export declare class SeriesMenu extends React.Component<SeriesMenuProps, SeriesMenuState> {
    state: SeriesMenuState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    globalKeyDownListener: (e: KeyboardEvent) => void;
    saveSeries: (series: Series, isValid: boolean) => void;
    onCancelClick: () => void;
    onOkClick: () => void;
    validate(): boolean;
    render(): JSX.Element;
}
export {};
