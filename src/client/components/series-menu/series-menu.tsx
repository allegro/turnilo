/*
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Measure } from "../../../common/models/measure/measure";
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";
import { ExpressionSeriesMenu } from "./expression-series-menu";
import { MeasureSeriesMenu } from "./measure-series-menu";
import "./series-menu.scss";

interface SeriesMenuProps {
  saveSeries: Unary<Series, void>;
  measure: Measure;
  containerStage: Stage;
  onClose: Fn;
  initialSeries: Series;
  openOn: Element;
}

interface SeriesMenuState {
  series: Series;
  isValid: boolean;
}

export class SeriesMenu extends React.Component<SeriesMenuProps, SeriesMenuState> {

  state: SeriesMenuState = { series: this.props.initialSeries, isValid: true };

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveSeries = (series: Series, isValid: boolean) => this.setState({ series, isValid });

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    if (!this.validate()) return;
    const { saveSeries, onClose } = this.props;
    const { series } = this.state;
    saveSeries(series);
    onClose();
  }

  validate() {
    const { initialSeries } = this.props;
    const { isValid, series } = this.state;
    return isValid && !initialSeries.equals(series);
  }

  render() {
    const { measure, containerStage, onClose, openOn } = this.props;
    const { series } = this.state;

    return <BubbleMenu
      className="series-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
    >
      {series instanceof MeasureSeries && <MeasureSeriesMenu
        series={series}
        measure={measure}
        onChange={this.saveSeries}
      />}
      {series instanceof ExpressionSeries && <ExpressionSeriesMenu
        series={series}
        measure={measure}
        onChange={this.saveSeries}
      />}
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={!this.validate()} onClick={this.onOkClick} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel} />
      </div>
    </BubbleMenu>;
  }
}
