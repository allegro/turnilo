/*
 * Copyright 2015-2016 Imply Data, Inc.
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

require('./split-menu.css');

import * as React from "react";
import { Timezone, Duration } from "chronoshift";
import { TimeBucketAction, NumberBucketAction, SortAction } from "plywood";
import { Fn, formatGranularity } from "../../../common/utils/index";
import {
  Stage,
  Clicker,
  Essence,
  VisStrategy,
  SplitCombine,
  Colors,
  Dimension,
  SortOn,
  Granularity,
  granularityToString,
  updateBucketSize,
  getGranularities,
  ContinuousDimensionKind
} from "../../../common/models/index";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { SvgIcon } from "../svg-icon/svg-icon";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Dropdown } from "../dropdown/dropdown";
import { ButtonGroup } from "../button-group/button-group";

function formatLimit(limit: number | string): string {
  if (limit === 'custom') return 'Custom';
  return limit === null ? 'None' : String(limit);
}

export interface SplitMenuProps extends React.Props<any> {
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
  split?: SplitCombine;
  colors?: Colors;
}

export class SplitMenu extends React.Component<SplitMenuProps, SplitMenuState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      split: null,
      colors: null
    };
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  componentWillMount() {
    var { essence, split } = this.props;
    var { dataSource, colors } = essence;

    var myColors: Colors = null;
    if (colors) {
      var colorDimension = dataSource.getDimension(colors.dimension);
      if (colorDimension.expression.equals(split.expression)) {
        myColors = colors;
      }
    }

    this.setState({
      split,
      colors: myColors
    });
  }

  componentDidMount() {
    window.addEventListener('keydown', this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.globalKeyDownListener);
  }

  globalKeyDownListener(e: KeyboardEvent) {
    if (enterKey(e)) {
      this.onOkClick();
    }
  }

  onSelectGranularity(granularity: Granularity): void {
    var { split } = this.state;
    var bucketAction = split.bucketAction as Granularity;
    this.setState({
      split: split.changeBucketAction(updateBucketSize(bucketAction, granularity))
    });
  }

  onSelectSortOn(sortOn: SortOn): void {
    var { split } = this.state;
    var sortAction = split.sortAction;
    var direction = sortAction ? sortAction.direction : SortAction.DESCENDING;
    this.setState({
      split: split.changeSortAction(new SortAction({
        expression: sortOn.getExpression(),
        direction
      }))
    });
  }

  onToggleDirection(): void {
    var { split } = this.state;
    var { sortAction } = split;
    this.setState({
      split: split.changeSortAction(sortAction.toggleDirection())
    });
  }

  onSelectLimit(limit: number): void {
    var { essence } = this.props;
    var { split } = this.state;
    var { colors } = essence;

    if (colors) {
      colors = Colors.fromLimit(colors.dimension, limit);
    }

    this.setState({
      split: split.changeLimit(limit),
      colors
    });
  }

  onOkClick() {
    if (!this.actionEnabled()) return;
    var { clicker, essence, onClose } = this.props;
    var { split, colors } = this.state;

    clicker.changeSplits(essence.splits.replace(this.props.split, split), VisStrategy.UnfairGame, colors);
    onClose();
  }

  onCancelClick() {
    var { onClose } = this.props;
    onClose();
  }

  getSortOn(): SortOn {
    var { essence, dimension } = this.props;
    var { split } = this.state;
    return SortOn.fromSortAction(split.sortAction, essence.dataSource, dimension);
  }

  renderGranularityPicker(type: ContinuousDimensionKind) {
    var { split } = this.state;
    var { dimension } = this.props;
    var selectedGran = granularityToString(split.bucketAction as Granularity);
    const granularities = dimension.granularities || getGranularities(type, dimension.bucketedBy);
    var buttons = granularities.map((g: Granularity) => {
      const granularityStr = granularityToString(g);
      return {
        isSelected: granularityStr === selectedGran,
        title: formatGranularity(granularityStr),
        key: granularityStr,
        onClick: this.onSelectGranularity.bind(this, g)
      };
    });

    return <ButtonGroup title={STRINGS.granularity} groupMembers={buttons} />;
  }

  renderSortDropdown() {
    var { essence, dimension } = this.props;

    var sortOns = [SortOn.fromDimension(dimension)].concat(essence.dataSource.measures.toArray().map(SortOn.fromMeasure));

    const SortOnDropdown = Dropdown.specialize<SortOn>();

    return <SortOnDropdown
      label={STRINGS.sortBy}
      items={sortOns}
      selectedItem={this.getSortOn()}
      equal={SortOn.equal}
      renderItem={SortOn.getTitle}
      keyItem={SortOn.getName}
      onSelect={this.onSelectSortOn.bind(this)}
    />;
  }

  renderSortDirection() {
    var { split } = this.state;
    var direction = split.sortAction.direction;

    return <div className="sort-direction">
      {this.renderSortDropdown()}
      <div className={'direction ' + direction} onClick={this.onToggleDirection.bind(this)}>
        <SvgIcon svg={require('../../icons/sort-arrow.svg')}/>
      </div>
    </div>;
  }

  renderLimitDropdown(includeNone: boolean) {
    var { essence } = this.props;
    var { split, colors } = this.state;
    var { limitAction } = split;

    var items: Array<number | string> = [5, 10, 25, 50, 100];
    var selectedItem: number | string = limitAction ? limitAction.limit : null;
    if (colors) {
      items = [3, 5, 7, 9, 10];
      selectedItem = colors.values ? 'custom' : colors.limit;
    }

    if (includeNone) items.unshift(null);

    const MyDropdown = Dropdown.specialize<number | string>();

    return <MyDropdown
      label={STRINGS.limit}
      items={items}
      selectedItem={selectedItem}
      renderItem={formatLimit}
      onSelect={this.onSelectLimit.bind(this)}
    />;
  }

  renderTimeControls() {
    return <div>
      {this.renderGranularityPicker('time')}
      {this.renderSortDirection()}
      {this.renderLimitDropdown(true)}
    </div>;
  }

  renderNumberControls() {
    return <div>
      {this.renderGranularityPicker('number')}
      {this.renderSortDirection()}
      {this.renderLimitDropdown(true)}
    </div>;
  }

  renderStringControls() {
    return <div>
      {this.renderSortDirection()}
      {this.renderLimitDropdown(false)}
    </div>;
  }

  actionEnabled() {
    var originalSplit = this.props.split;
    var originalColors = this.props.essence.colors;
    var newSplit = this.state.split;
    var newColors = this.state.colors;

    return !originalSplit.equals(newSplit) || (originalColors && !originalColors.equals(newColors));
  }

  render() {
    var { containerStage, openOn, dimension, onClose, inside } = this.props;
    var { split } = this.state;
    if (!dimension) return null;

    var menuSize = Stage.fromSize(250, 240);

    var menuControls: JSX.Element = null;
    if (split.bucketAction instanceof TimeBucketAction) {
      menuControls = this.renderTimeControls();
    } else if (split.bucketAction instanceof NumberBucketAction) {
      menuControls = this.renderNumberControls();
    } else {
      menuControls = this.renderStringControls();
    }

    return <BubbleMenu
      className="split-menu"
      direction="down"
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      {menuControls}
      <div className="button-bar">
        <button className="ok" onClick={this.onOkClick.bind(this)} disabled={!this.actionEnabled()}>{STRINGS.ok}</button>
        <button className="cancel" onClick={this.onCancelClick.bind(this)}>{STRINGS.cancel}</button>
      </div>
    </BubbleMenu>;
  }
}
