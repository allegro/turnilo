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
import { Measure } from "../../../../common/models/measure/measure";
import { QuantileSeriesDefinition } from "../../../../common/models/series/series-definition";
import { SeriesFormat } from "../../../../common/models/series/series-format";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { enterKey } from "../../../utils/dom/dom";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { Button } from "../../button/button";
import { FormatPicker } from "../format-picker";
import { PercentilePicker } from "./percentile-picker";

interface QuantileSeriesMenuProps {
  onSave: Unary<QuantileSeriesDefinition, void>;
  measure: Measure;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  series: QuantileSeriesDefinition;
  inside?: Element;
}

interface QuantileSeriesMenuState {
  format: SeriesFormat;
  percentile: number;
}

export class QuantileSeriesMenu extends React.Component<QuantileSeriesMenuProps, QuantileSeriesMenuState> {

  state: QuantileSeriesMenuState = { format: this.props.series.format, percentile: this.props.series.percentile || 95 };

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveFormat = (format: SeriesFormat) => this.setState({ format });

  savePercentile = (percentile: number) => this.setState({ percentile });

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    if (!this.validate()) return;
    const { onSave, onClose } = this.props;
    onSave(this.constructSeries());
    onClose();
  }

  validate() {
    const series = this.constructSeries();
    return !this.props.series.equals(series);
  }

  validatePercentile(): string {
    const { percentile } = this.state;
    if (percentile < 0 || percentile > 100) return "Percentile must be between 0 and 100";
    return null;
  }

  private constructSeries() {
    const { series } = this.props;
    const { format, percentile } = this.state;
    return series
      .set("format", format)
      .set("percentile", percentile);
  }

  render() {
    const { measure, containerStage, openOn, onClose, inside } = this.props;
    if (!measure) return null;

    const { percentile, format } = this.state;
    const percentileError = this.validatePercentile();

    return <BubbleMenu
      className="series-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
      inside={inside}>
      <FormatPicker
        measure={measure}
        format={format}
        formatChange={this.saveFormat} />
      <PercentilePicker
        error={percentileError}
        percentile={percentile}
        percentileChange={this.savePercentile} />
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={!this.validate()} onClick={this.onOkClick} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel} />
      </div>
    </BubbleMenu>;
  }
}
