/*
 * Copyright 2017-2022 Allegro.pl
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

import React, { useMemo, useState } from "react";
import { colorSplitLimits } from "../../../common/models/colors/colors";
import { granularityToString } from "../../../common/models/granularity/granularity";
import { DimensionSortOn, SortOn } from "../../../common/models/sort-on/sort-on";
import { useSettingsContext } from "../../views/cube-view/settings-context";
import { getContinuousSplit } from "../../visualizations/line-chart/utils/splits";
import { GranularityPicker } from "../split-menu/granularity-picker";
import { LimitDropdown } from "../split-menu/limit-dropdown";
import { SortDropdown } from "../split-menu/sort-dropdown";
import { SplitMenuProps } from "../split-menu/split-menu";
import { createSplit, SplitMenuBase, validateSplit } from "../split-menu/split-menu-base";

const TimeSeriesContinuousSplitMenu: React.FunctionComponent<SplitMenuProps> = props => {
  const { saveSplit, containerStage, split, dimension, onClose, openOn } = props;
  const [granularity, setGranularity] = useState(() => split.bucket && granularityToString(split.bucket));

  const onSave = () => {
    const newSplit = createSplit({
      dimension,
      split,
      granularity
    });
    saveSplit(split, newSplit);
  };

  const isValid = validateSplit({ split, dimension, granularity });

  return <SplitMenuBase
    openOn={openOn}
    containerStage={containerStage}
    onClose={onClose}
    onSave={onSave}
    dimension={dimension}
    isValid={isValid}>
    <GranularityPicker
      granularity={granularity}
      dimension={dimension}
      granularityChange={setGranularity}/>
  </SplitMenuBase>;
};

const TimeSeriesCategorySplitMenu: React.FunctionComponent<SplitMenuProps> = props => {
  const { openOn, containerStage, onClose, dimension, saveSplit, split, essence } = props;

  const sortOptions = [
    new DimensionSortOn(dimension),
    ...essence.seriesSortOns(true).toArray()
  ];

  const { customization: { visualizationColors: { series } } } = useSettingsContext();
  const limitOptions = useMemo(() => colorSplitLimits(series.length), [series.length]);

  const [sort, setSort] = useState(split.sort);
  const [limit, setLimit] = useState(split.limit);

  const isValid = validateSplit({ split, dimension, limit, sort });

  const onSave = () => {
    const newSplit = createSplit({
      dimension,
      split,
      limit,
      sort
    });
    saveSplit(split, newSplit);
  };

  return <SplitMenuBase
    openOn={openOn}
    containerStage={containerStage}
    onClose={onClose}
    onSave={onSave}
    dimension={dimension}
    isValid={isValid}>
    <SortDropdown
      direction={sort.direction}
      selected={SortOn.fromSort(sort, essence)}
      options={sortOptions}
      onChange={setSort}/>
    <LimitDropdown
      selectedLimit={limit}
      limits={limitOptions}
      includeNone={false}
      onLimitSelect={setLimit}/>
  </SplitMenuBase>;
};

export const TimeSeriesSplitMenu: React.FunctionComponent<SplitMenuProps> = props => {
  const { essence, split } = props;

  const isContinuousSplit = split.equals(getContinuousSplit(essence));

  if (isContinuousSplit) {
    return <TimeSeriesContinuousSplitMenu {...props} />;
  } else {
    return <TimeSeriesCategorySplitMenu {...props} />;
  }
};
