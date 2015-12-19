'use strict';
require('./pinboard-panel.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List, OrderedSet } from 'immutable';
import { $, Expression, Executor, Dataset, RefExpression, SortAction } from 'plywood';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Clicker, Essence, DataSource, Filter, Dimension, Measure, SortOn, VisStrategy } from '../../../common/models/index';
import { DragManager } from '../../utils/drag-manager/drag-manager';
import { PinboardMeasureTile } from '../pinboard-measure-tile/pinboard-measure-tile';
import { DimensionTile } from '../dimension-tile/dimension-tile';

export interface PinboardPanelProps extends React.Props<any> {
  clicker: Clicker;
  essence: Essence;
}

export interface PinboardPanelState {
  dragOver?: boolean;
}

export class PinboardPanel extends React.Component<PinboardPanelProps, PinboardPanelState> {
  private dragCounter: number;

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

  dragOver(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.dataTransfer.dropEffect = 'move';
    e.preventDefault();
  }

  dragEnter(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) {
      this.dragCounter = 0;
      this.setState({
        dragOver: true
      });
    } else {
      this.dragCounter++;

    }
  }

  dragLeave(e: DragEvent) {
    if (!this.canDrop(e)) return;
    var { dragOver } = this.state;
    if (!dragOver) return;
    if (this.dragCounter === 0) {
      this.setState({
        dragOver: false
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(e: DragEvent) {
    if (!this.canDrop(e)) return;
    e.preventDefault();
    this.dragCounter = 0;
    var dimension = DragManager.getDragDimension();
    if (dimension) {
      this.props.clicker.pin(dimension);
    }
    this.setState({ dragOver: false });
  }

  getColorsSortOn(): SortOn {
    var { essence } = this.props;
    var { dataSource, splits, colors } = essence;
    if (colors) {
      var dimension = dataSource.getDimension(colors.dimension);
      if (dimension) {
        var split = splits.findSplitForDimension(dimension);
        if (split) {
          return SortOn.fromSortAction(split.sortAction, dataSource, dimension);
        }
      }
    }
    return null;
  }

  onLegendSortOnSelect(sortOn: SortOn) {
    var { clicker, essence } = this.props;
    var { dataSource, splits, colors } = essence;
    if (colors) {
      var dimension = dataSource.getDimension(colors.dimension);
      if (dimension) {
        var split = splits.findSplitForDimension(dimension);
        if (split) {
          var sortAction = split.sortAction;
          var direction = sortAction ? sortAction.direction : SortAction.DESCENDING;
          var newSplit = split.changeSortAction(new SortAction({
            expression: sortOn.getExpression(),
            direction
          }));
          clicker.changeSplits(splits.replace(split, newSplit), VisStrategy.UnfairGame); // colors
        }
      }
    }
  }

  onPinboardSortOnSelect(sortOn: SortOn) {
    if (!sortOn.measure) return;
    var { clicker } = this.props;
    clicker.changePinnedSortMeasure(sortOn.measure);
  }

  render() {
    var { clicker, essence } = this.props;
    var { dragOver } = this.state;
    var { dataSource, pinnedDimensions, colors } = essence;

    var legendMeasureSelector: JSX.Element = null;
    var legendDimensionTile: JSX.Element = null;
    var colorDimension = colors ? colors.dimension : null;
    if (colorDimension) {
      var dimension = dataSource.getDimension(colorDimension);
      if (dimension) {
        var colorsSortOn = this.getColorsSortOn();

        legendMeasureSelector = <PinboardMeasureTile
          essence={essence}
          title="Legend"
          sortOn={colorsSortOn}
          onSelect={this.onLegendSortOnSelect.bind(this)}
        />;

        legendDimensionTile = <DimensionTile
          clicker={clicker}
          essence={essence}
          dimension={dimension}
          sortOn={colorsSortOn}
          colors={colors}
        />;
      }
    }

    var pinnedSortSortOn = SortOn.fromMeasure(essence.getPinnedSortMeasure());
    var dimensionTiles: JSX.Element[] = [];
    pinnedDimensions.forEach((dimensionName) => {
      var dimension = dataSource.getDimension(dimensionName);
      if (!dimension) return null;

      dimensionTiles.push(<DimensionTile
        key={dimension.name}
        clicker={clicker}
        essence={essence}
        dimension={dimension}
        sortOn={pinnedSortSortOn}
      />);
    });

    var dropIndicatorTile: JSX.Element = null;
    if (dragOver) {
      dropIndicatorTile = <div className="drop-indicator-tile"></div>;
    }

    var placeholder: JSX.Element = null;
    if (!dragOver && !dimensionTiles.length) {
      placeholder = <div className="placeholder">
        <SvgIcon svg={require('../../icons/preview-pin.svg')}/>
        <div className="placeholder-message">Click or drag dimensions to pin them</div>
      </div>;
    }

    return <div
      className="pinboard-panel"
      onDragOver={this.dragOver.bind(this)}
      onDragEnter={this.dragEnter.bind(this)}
      onDragLeave={this.dragLeave.bind(this)}
      onDrop={this.drop.bind(this)}
    >
      {legendMeasureSelector}
      {legendDimensionTile}
      <PinboardMeasureTile
        essence={essence}
        title="Pinboard"
        sortOn={pinnedSortSortOn}
        onSelect={this.onPinboardSortOnSelect.bind(this)}
      />
      {dimensionTiles}
      {dropIndicatorTile}
      {placeholder}
    </div>;
  }
}
