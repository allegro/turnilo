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

import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Colors } from "../../../common/models/colors/colors";
import { Essence, VisStrategy } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { SortOn } from "../../../common/models/sort-on/sort-on";
import { Sort } from "../../../common/models/sort/sort";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { SortDirection } from "../../../common/view-definitions/version-3/split-definition";
import { STRINGS } from "../../config/constants";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { DimensionTile } from "../dimension-tile/dimension-tile";
import { PinboardMeasureTile } from "../pinboard-measure-tile/pinboard-measure-tile";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./pinboard-panel.scss";

export interface PinboardPanelProps {
  clicker: Clicker;
  essence: Essence;
  timekeeper: Timekeeper;
  style?: React.CSSProperties;
}

export interface PinboardPanelState {
  dragOver?: boolean;
}

export class PinboardPanel extends React.Component<PinboardPanelProps, PinboardPanelState> {

  constructor(props: PinboardPanelProps) {
    super(props);
    this.state = {
      dragOver: false
    };
  }

  canDrop(e: DragEvent): boolean {
    const dimension = DragManager.getDragDimension();
    if (dimension) {
      const pinnedDimensions = this.props.essence.pinnedDimensions;
      return !pinnedDimensions.has(dimension.name);
    }
    return false;
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    this.setState({ dragOver: true });
  }

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = "move";
    e.preventDefault();
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    this.setState({ dragOver: false });
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    const dimension = DragManager.getDragDimension();
    if (dimension) {
      this.props.clicker.pin(dimension);
    }
    this.setState({ dragOver: false });
  }

  getColorsSortOn(): SortOn {
    const { essence } = this.props;
    const { dataCube, splits, colors } = essence;
    if (colors) {
      const dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        const split = splits.findSplitForDimension(dimension);
        if (split) {
          const sortReference = split.sort.reference;
          return new SortOn(dataCube.getDimension(sortReference) || dataCube.getMeasure(sortReference));
        }
      }
    }
    return null;
  }

  onLegendSortOnSelect(sortOn: SortOn) {
    const { clicker, essence } = this.props;
    const { dataCube, splits, colors } = essence;
    if (colors) {
      const dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        const split = splits.findSplitForDimension(dimension);
        if (split) {
          const sort = split.sort;
          const direction = sort ? sort.direction : SortDirection.descending;
          const newSplit = split.changeSort(new Sort({
            reference: sortOn.getName(),
            direction
          }));
          const newColors = Colors.fromLimit(colors.dimension, 5);
          clicker.changeSplits(splits.replace(split, newSplit), VisStrategy.UnfairGame, newColors);
        }
      }
    }
  }

  onPinboardSortOnSelect(sortOn: SortOn) {
    if (!(sortOn.reference instanceof Measure)) return;
    this.props.clicker.changePinnedSortMeasure(sortOn.reference);
  }

  onRemoveLegend() {
    const { clicker, essence } = this.props;
    const { dataCube, splits, colors } = essence;

    if (colors) {
      const dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        const split = splits.findSplitForDimension(dimension);
        if (split) {
          clicker.changeSplits(splits.removeSplit(split), VisStrategy.UnfairGame, null);
        }
      }
    }
  }

  render() {
    const { clicker, essence, timekeeper, style } = this.props;
    const { dragOver } = this.state;
    const { dataCube, pinnedDimensions, colors } = essence;

    let legendMeasureSelector: JSX.Element = null;
    let legendDimensionTile: JSX.Element = null;
    let colorDimension = colors ? colors.dimension : null;
    if (colorDimension) {
      const dimension = dataCube.getDimension(colorDimension);
      const colorsSortOn = this.getColorsSortOn();
      if (dimension && colorsSortOn) {
        legendMeasureSelector = <PinboardMeasureTile
          essence={essence}
          title="Legend"
          dimension={dimension}
          sortOn={colorsSortOn}
          onSelect={this.onLegendSortOnSelect.bind(this)}
        />;

        legendDimensionTile = <DimensionTile
          clicker={clicker}
          essence={essence}
          timekeeper={timekeeper}
          dimension={dimension}
          sortOn={colorsSortOn}
          colors={colors}
          onClose={this.onRemoveLegend.bind(this)}
        />;
      }
    }

    const pinnedSortSortOn = SortOn.fromMeasure(essence.getPinnedSortMeasure());
    let dimensionTiles: JSX.Element[] = [];
    pinnedDimensions.forEach(dimensionName => {
      const dimension = dataCube.getDimension(dimensionName);
      if (!dimension) return null;

      dimensionTiles.push(<DimensionTile
        key={dimension.name}
        clicker={clicker}
        essence={essence}
        timekeeper={timekeeper}
        dimension={dimension}
        sortOn={pinnedSortSortOn}
        onClose={clicker.unpin ? clicker.unpin.bind(clicker, dimension) : null}
      />);
    });

    let placeholder: JSX.Element = null;
    if (!dragOver && !dimensionTiles.length) {
      placeholder = <div className="placeholder">
        <SvgIcon svg={require("../../icons/preview-pin.svg")} />
        <div className="placeholder-message">{STRINGS.pinboardPlaceholder}</div>
      </div>;
    }

    return <div
      className="pinboard-panel"
      onDragEnter={this.dragEnter.bind(this)}
      style={style}
    >
      {legendMeasureSelector}
      {legendDimensionTile}
      <PinboardMeasureTile
        essence={essence}
        title={STRINGS.pinboard}
        sortOn={pinnedSortSortOn}
        onSelect={this.onPinboardSortOnSelect.bind(this)}
      />
      {dimensionTiles}
      {dragOver ? <div className="drop-indicator-tile" /> : null}
      {placeholder}
      {dragOver ? <div
        className="drag-mask"
        onDragOver={this.dragOver.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDragExit={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      /> : null}
    </div>;
  }
}
