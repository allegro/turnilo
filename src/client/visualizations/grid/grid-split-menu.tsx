/*
 * Copyright 2017-2021 Allegro.pl
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
import { isContinuous } from "../../../common/models/dimension/dimension";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { granularityToString } from "../../../common/models/granularity/granularity";
import { DimensionSortOn, SortOn } from "../../../common/models/sort-on/sort-on";
import { Sort } from "../../../common/models/sort/sort";
import { Split } from "../../../common/models/split/split";
import { GRID_LIMITS } from "../../../common/visualization-manifests/grid/grid";
import { GranularityPicker } from "../../components/split-menu/granularity-picker";
import { LimitDropdown } from "../../components/split-menu/limit-dropdown";
import { SortDropdown } from "../../components/split-menu/sort-dropdown";
import { SplitMenuProps } from "../../components/split-menu/split-menu";
import { createSplit, SplitMenuBase, validateSplit } from "../../components/split-menu/split-menu-base";
import { mainSplit } from "./utils/main-split";

export const GridSplitMenu: React.SFC<SplitMenuProps> = props => {
  const { essence, split, dimension } = props;
  const controlSplit = split.equals(mainSplit(essence));
  if (controlSplit) {
    return <GridControlMenu {...props} />;
  }
  if (isContinuous(dimension)) {
    return <SplitGranularityMenu {...props} />;
  }
  return null;
};

interface SplitGranularityMenuState {
  granularity: string;
}

class SplitGranularityMenu extends React.Component<SplitMenuProps, SplitGranularityMenuState> {

  state: SplitGranularityMenuState = {
    granularity: granularityToString(this.props.split.bucket)
  };

  saveGranularity = (granularity: string) => this.setState({ granularity });

  saveSplit = () => {
    const { split, saveSplit } = this.props;
    saveSplit(split, this.createSplit());
  };

  private createSplit(): Split {
    const { split, dimension } = this.props;
    const { granularity } = this.state;
    return createSplit({ split, dimension, granularity });
  }

  validate() {
    const { dimension, split } = this.props;
    const { granularity } = this.state;
    return validateSplit({ split, dimension, granularity });
  }

  render() {
    const { containerStage, dimension, onClose, openOn } = this.props;
    const { granularity } = this.state;
    return <SplitMenuBase
      openOn={openOn}
      containerStage={containerStage}
      onClose={onClose}
      onSave={this.saveSplit}
      dimension={dimension}
      isValid={this.validate()}>
      <GranularityPicker
        dimension={dimension}
        granularity={granularity}
        granularityChange={this.saveGranularity}/>
    </SplitMenuBase>;
  }
}

interface GridControlMenuProps {
  granularity?: string;
  sort?: Sort;
  limit?: number;
}

class GridControlMenu extends React.Component<SplitMenuProps, GridControlMenuProps> {

  state: GridControlMenuProps = this.initState();

  private initState(): GridControlMenuProps {
    const { split: { bucket, sort, limit } } = this.props;
    return {
      sort,
      limit,
      granularity: bucket && granularityToString(bucket)
    };
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
    const { containerStage, dimension, onClose, essence, openOn } = this.props;
    const { granularity, sort, limit } = this.state;
    const { dimensions } = essence.dataCube;
    const sortOptions = [
      ...essence.splits.splits.toArray().map(({ reference }) => new DimensionSortOn(findDimensionByName(dimensions, reference))),
      ...essence.seriesSortOns(true).toArray()
    ];
    return <SplitMenuBase
      openOn={openOn}
      containerStage={containerStage}
      onClose={onClose}
      onSave={this.saveSplit}
      dimension={dimension}
      isValid={this.validate()}>
      <GranularityPicker
        dimension={dimension}
        granularity={granularity}
        granularityChange={this.saveGranularity}/>
      <SortDropdown
        direction={sort.direction}
        selected={SortOn.fromSort(sort, essence)}
        options={sortOptions}
        onChange={this.saveSort}/>
      <LimitDropdown
        selectedLimit={limit}
        limits={GRID_LIMITS}
        includeNone={false}
        onLimitSelect={this.saveLimit}/>
    </SplitMenuBase>;
 }
}
