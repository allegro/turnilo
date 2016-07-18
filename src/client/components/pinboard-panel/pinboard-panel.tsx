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

require('./pinboard-panel.css');

import * as React from 'react';
import { $, Expression, SortAction } from 'plywood';
import { STRINGS } from '../../config/constants';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Clicker, Essence, SortOn, VisStrategy, Colors } from '../../../common/models/index';
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { PinboardMeasureTile } from '../pinboard-measure-tile/pinboard-measure-tile';
import { DimensionTile } from '../dimension-tile/dimension-tile';

export interface PinboardPanelProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
  getUrlPrefix?: () => string;
  style?: React.CSSProperties;
}

export interface PinboardPanelState {
  dragOver?: boolean;
}

export class PinboardPanel extends React.Component<PinboardPanelProps, PinboardPanelState> {

  constructor() {
    super();
    this.state = {
      dragOver: false
    };
  }

  canDrop(e: DragEvent): boolean {
    var dimension = DragManager.getDragDimension();
    if (dimension) {
      var pinnedDimensions = this.props.essence.pinnedDimensions;
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
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    this.setState({ dragOver: false });
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    var dimension = DragManager.getDragDimension();
    if (dimension) {
      this.props.clicker.pin(dimension);
    }
    this.setState({ dragOver: false });
  }

  getColorsSortOn(): SortOn {
    var { essence } = this.props;
    var { dataCube, splits, colors } = essence;
    if (colors) {
      var dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        var split = splits.findSplitForDimension(dimension);
        if (split) {
          return SortOn.fromSortAction(split.sortAction, dataCube, dimension);
        }
      }
    }
    return null;
  }

  onLegendSortOnSelect(sortOn: SortOn) {
    var { clicker, essence } = this.props;
    var { dataCube, splits, colors } = essence;
    if (colors) {
      var dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        var split = splits.findSplitForDimension(dimension);
        if (split) {
          var sortAction = split.sortAction;
          var direction = sortAction ? sortAction.direction : SortAction.DESCENDING;
          var newSplit = split.changeSortAction(new SortAction({
            expression: sortOn.getExpression(),
            direction
          }));
          var newColors = Colors.fromLimit(colors.dimension, 5);
          clicker.changeSplits(splits.replace(split, newSplit), VisStrategy.UnfairGame, newColors);
        }
      }
    }
  }

  onPinboardSortOnSelect(sortOn: SortOn) {
    if (!sortOn.measure) return;
    var { clicker } = this.props;
    clicker.changePinnedSortMeasure(sortOn.measure);
  }

  onRemoveLegend() {
    var { clicker, essence } = this.props;
    var { dataCube, splits, colors } = essence;

    if (colors) {
      var dimension = dataCube.getDimension(colors.dimension);
      if (dimension) {
        var split = splits.findSplitForDimension(dimension);
        if (split) {
          clicker.changeSplits(splits.removeSplit(split), VisStrategy.UnfairGame, null);
        }
      }
    }
  }

  render() {
    var { clicker, essence, getUrlPrefix, style } = this.props;
    var { dragOver } = this.state;
    var { dataCube, pinnedDimensions, colors } = essence;

    var legendMeasureSelector: JSX.Element = null;
    var legendDimensionTile: JSX.Element = null;
    var colorDimension = colors ? colors.dimension : null;
    if (colorDimension) {
      var dimension = dataCube.getDimension(colorDimension);
      if (dimension) {
        var colorsSortOn = this.getColorsSortOn();

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
          dimension={dimension}
          sortOn={colorsSortOn}
          colors={colors}
          onClose={this.onRemoveLegend.bind(this)}
          getUrlPrefix={getUrlPrefix}
        />;
      }
    }

    var pinnedSortSortOn = SortOn.fromMeasure(essence.getPinnedSortMeasure());
    var dimensionTiles: JSX.Element[] = [];
    pinnedDimensions.forEach((dimensionName) => {
      var dimension = dataCube.getDimension(dimensionName);
      if (!dimension) return null;

      dimensionTiles.push(<DimensionTile
        key={dimension.name}
        clicker={clicker}
        essence={essence}
        dimension={dimension}
        sortOn={pinnedSortSortOn}
        onClose={clicker.unpin ? clicker.unpin.bind(clicker, dimension) : null}
        getUrlPrefix={getUrlPrefix}
      />);
    });

    var placeholder: JSX.Element = null;
    if (!dragOver && !dimensionTiles.length) {
      placeholder = <div className="placeholder">
        <SvgIcon svg={require('../../icons/preview-pin.svg')}/>
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
      {dragOver ? <div className="drop-indicator-tile"/> : null}
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
