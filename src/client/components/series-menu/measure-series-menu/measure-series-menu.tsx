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
import { MeasureSeriesDefinition } from "../../../../common/models/series/series-definition";
import { SeriesFormat } from "../../../../common/models/series/series-format";
import { Stage } from "../../../../common/models/stage/stage";
import { Unary } from "../../../../common/utils/functional/functional";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { enterKey } from "../../../utils/dom/dom";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { Button } from "../../button/button";
import { FormatPicker } from "../format-picker";
import "./measure-series-menu.scss";

interface MeasureSeriesMenuProps {
  onSave: Unary<MeasureSeriesDefinition, void>;
  measure: Measure;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  series: MeasureSeriesDefinition;
  inside?: Element;
}

interface MeasureSeriesMenuState {
  format: SeriesFormat;
}

export class MeasureSeriesMenu extends React.Component<MeasureSeriesMenuProps, MeasureSeriesMenuState> {

  state: MeasureSeriesMenuState = { format: this.props.series.format };

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveFormat = (format: SeriesFormat) => this.setState({ format });

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    if (!this.hasChanged()) return;
    const { onSave, onClose } = this.props;
    onSave(this.constructSeries());
    onClose();
  }

  hasChanged() {
    const series = this.constructSeries();
    return !this.props.series.equals(series);
  }

  private constructSeries() {
    const { series } = this.props;
    const { format } = this.state;
    return series.set("format", format);
  }

  render() {
    const { measure, containerStage, openOn, onClose, inside } = this.props;
    if (!measure) return null;

    const { format } = this.state;
    const disabled = !this.hasChanged();

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
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={disabled} onClick={this.onOkClick} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel} />
      </div>
    </BubbleMenu>;
  }
}
