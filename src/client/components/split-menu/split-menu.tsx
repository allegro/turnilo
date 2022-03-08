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

import React from "react";
import { Dimension, isContinuous } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { granularityToString } from "../../../common/models/granularity/granularity";
import { DimensionSortOn, SortOn } from "../../../common/models/sort-on/sort-on";
import { Sort } from "../../../common/models/sort/sort";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { GranularityPicker } from "./granularity-picker";
import { LimitDropdown } from "./limit-dropdown";
import { SortDropdown } from "./sort-dropdown";
import { createSplit, SplitMenuBase, validateSplit } from "./split-menu-base";
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
  granularity?: string;
  sort?: Sort;
  limit?: number;
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {

  state: SplitMenuState = {};

  componentWillMount() {
    const { split } = this.props;
    const { bucket, sort, limit } = split;

    this.setState({
      sort,
      limit,
      granularity: bucket && granularityToString(bucket)
    });
  }

  saveGranularity = (granularity: string) => this.setState({ granularity });

  saveSort = (sort: Sort) => this.setState({ sort });

  saveLimit = (limit: number) => this.setState({ limit });

  saveSplit = () => {
    const { split, saveSplit } = this.props;
    saveSplit(split, this.createSplit());
  };

  private createSplit(): Split {
    const { split, dimension } = this.props;
    const { limit, sort, granularity } = this.state;
    return createSplit({ split, dimension, limit, sort, granularity });
  }

  validate() {
    const { dimension, split } = this.props;
    const { limit, sort, granularity } = this.state;
    return validateSplit({ split, dimension, limit, sort, granularity });
  }

  render() {
    const { essence, containerStage, openOn, dimension, onClose } = this.props;
    const { granularity, sort, limit } = this.state;

    const seriesSortOns = essence.seriesSortOns(true).toArray();
    const options = [new DimensionSortOn(dimension), ...seriesSortOns];
    const selected = SortOn.fromSort(sort, essence);

    return <SplitMenuBase
      openOn={openOn}
      containerStage={containerStage}
      onClose={onClose}
      onSave={this.saveSplit}
      dimension={dimension}
      isValid={this.validate()}>
      <GranularityPicker
        dimension={dimension}
        granularityChange={this.saveGranularity}
        granularity={granularity}
      />
      <SortDropdown
        direction={sort.direction}
        selected={selected}
        options={options}
        onChange={this.saveSort}
      />
      <LimitDropdown
        onLimitSelect={this.saveLimit}
        selectedLimit={limit}
        includeNone={isContinuous(dimension)}
        limits={dimension.limits}/>
    </SplitMenuBase>;
  }
}
