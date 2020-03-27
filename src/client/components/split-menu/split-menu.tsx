/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2019 Allegro.pl
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

import { Duration } from "chronoshift";
import * as React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { granularityToString, isGranularityValid } from "../../../common/models/granularity/granularity";
import { DimensionSortOn, SortOn } from "../../../common/models/sort-on/sort-on";
import { Sort } from "../../../common/models/sort/sort";
import { Bucket, Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";
import { GranularityPicker } from "./granularity-picker";
import { LimitDropdown } from "./limit-dropdown";
import { SortDropdown } from "./sort-dropdown";
import "./split-menu.scss";

export interface SplitMenuProps {
  essence: Essence;
  saveSplit: Binary<Split, Split, void>;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  dimension: Dimension;
  split: Split;
}

export interface SplitMenuState {
  reference?: string;
  granularity?: string;
  sort?: Sort;
  limit?: number;
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {

  state: SplitMenuState = {};

  componentWillMount() {
    const { split } = this.props;
    const { bucket, reference, sort, limit } = split;

    this.setState({
      reference,
      sort,
      limit,
      granularity: bucket && granularityToString(bucket)
    });
  }

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveGranularity = (granularity: string) => this.setState({ granularity });

  saveSort = (sort: Sort) => this.setState({ sort });

  saveLimit = (limit: number) => this.setState({ limit });

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    if (!this.validate()) return;
    const { split, saveSplit, onClose } = this.props;
    const newSplit = this.constructSplitCombine();
    saveSplit(split, newSplit);
    onClose();
  };

  private constructGranularity(): Bucket {
    const { dimension: { kind } } = this.props;
    const { granularity } = this.state;
    if (kind === "time") {
      return Duration.fromJS(granularity);
    }
    if (kind === "number") {
      return parseInt(granularity, 10);
    }
    return null;
  }

  private constructSplitCombine(): Split {
    const { split: { type } } = this.props;
    const { limit, sort, reference } = this.state;
    const bucket = this.constructGranularity();
    return new Split({ type, reference, limit, sort, bucket });
  }

  validate() {
    const { dimension: { kind }, split: originalSplit  } = this.props;
    if (!isGranularityValid(kind, this.state.granularity)) {
      return false;
    }
    const newSplit: Split = this.constructSplitCombine();
    return !originalSplit.equals(newSplit);
  }

  renderSortDropdown() {
    const { essence, dimension } = this.props;
    const { sort } = this.state;
    const seriesSortOns = essence.seriesSortOns(true).toArray();
    const options = [new DimensionSortOn(dimension), ...seriesSortOns];
    const selected = SortOn.fromSort(sort, essence);
    return <SortDropdown
      direction={sort.direction}
      selected={selected}
      options={options}
      onChange={this.saveSort}
    />;
  }

  render() {
    const { containerStage, openOn, dimension, onClose } = this.props;
    const { granularity, limit } = this.state;
    if (!dimension) return null;

    return <BubbleMenu
      className="split-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
    >
      <GranularityPicker
        dimension={dimension}
        granularityChange={this.saveGranularity}
        granularity={granularity}
      />
      {this.renderSortDropdown()}
      <LimitDropdown
        onLimitSelect={this.saveLimit}
        limit={limit}
        includeNone={dimension.isContinuous()} />
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={!this.validate()} onClick={this.onOkClick} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel} />
      </div>
    </BubbleMenu>;
  }
}
