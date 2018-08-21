/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Duration } from "chronoshift";
import { Expression, LimitExpression, NumberBucketExpression, SortExpression, TimeBucketExpression } from "plywood";
import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Colors } from "../../../common/models/colors/colors";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Granularity, granularityToString, isGranularityValid } from "../../../common/models/granularity/granularity";
import { SplitCombine } from "../../../common/models/split-combine/split-combine";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { GranularityPicker } from "./granularity-picker";
import { LimitDropdown } from "./limit-dropdown";
import { SortDropdown } from "./sort-dropdown";
import "./split-menu.scss";

export interface SplitMenuProps {
  clicker: Clicker;
  essence: Essence;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  dimension: Dimension;
  split: SplitCombine;
  inside?: Element;
}

export interface SplitMenuState {
  expression?: Expression;
  granularity?: string;
  sort?: SortExpression;
  limit?: number;
  colors?: Colors;
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
  public mounted: boolean;

  state: SplitMenuState = {};

  componentWillMount() {
    const { essence, split } = this.props;
    const { dataCube, colors } = essence;
    const { bucketAction, expression, sortAction: sort, limitAction } = split;

    const colorsDimensionMatch = colors && dataCube.getDimension(colors.dimension).expression.equals(split.expression);

    this.setState({
      expression,
      sort,
      limit: limitAction && limitAction.value,
      granularity: granularityToString(bucketAction as Granularity),
      colors: colorsDimensionMatch ? colors : null
    });
  }

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveGranularity = (granularity: string) => this.setState(state => ({ ...state, granularity }));

  saveSort = (sort: SortExpression) => this.setState(state => ({ ...state, sort }));

  saveLimit = (limit: number, colors: Colors) => this.setState(state => ({ ...state, colors, limit }));

  onCancelClick = () => this.props.onClose();

  onOkClick() {
    if (!this.validate()) return;
    const { split: originalSplit, clicker, essence, onClose } = this.props;
    const split = this.constructSplitCombine();
    clicker.changeSplits(essence.splits.replace(originalSplit, split), VisStrategy.UnfairGame, this.state.colors);
    onClose();
  }

  private constructGranularity(): Granularity {
    const { dimension: { kind } } = this.props;
    const { granularity } = this.state;
    if (kind === "time") {
      return new TimeBucketExpression({ duration: Duration.fromJS(granularity) });
    }
    if (kind === "number") {
      return new NumberBucketExpression({ size: parseInt(granularity, 10) });
    }
    return null;
  }

  private constructSplitCombine(): SplitCombine {
    const { limit, sort, expression } = this.state;
    return new SplitCombine({
      expression,
      bucketAction: this.constructGranularity(),
      limitAction: limit && LimitExpression.fromJS({ value: limit }),
      sortAction: sort
    });
  }

  validate() {
    const { dimension: { kind }, split: originalSplit, essence: { colors: originalColors } } = this.props;
    if (!isGranularityValid(kind, this.state.granularity)) {
      return false;
    }
    const newSplit: SplitCombine = this.constructSplitCombine();
    return !originalSplit.equals(newSplit)
      || (originalColors && !originalColors.equals(this.state.colors));
  }

  render() {
    const { essence: { dataCube }, containerStage, openOn, dimension, onClose, inside } = this.props;
    const { colors, sort, granularity, limit } = this.state;
    if (!dimension) return null;

    return <BubbleMenu
      className="split-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      <GranularityPicker
      dimension={dimension}
      granularityChange={this.saveGranularity}
      granularity={granularity}
      />
      <SortDropdown
        sort={sort}
        dataCube={dataCube}
        dimension={dimension}
        onChange={this.saveSort}
      />
      <LimitDropdown
        colors={colors}
        onLimitSelect={this.saveLimit}
        limit={limit}
        includeNone={dimension.isContinuous()}/>
      <div className="button-bar">
        <button className="ok" onClick={this.onOkClick.bind(this)} disabled={!this.validate()}>{STRINGS.ok}</button>
        <button className="cancel" onClick={this.onCancelClick}>{STRINGS.cancel}</button>
      </div>
    </BubbleMenu>;
  }
}
