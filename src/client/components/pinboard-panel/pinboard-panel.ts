'use strict';
require('./pinboard-panel.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List, OrderedSet } from 'immutable';
import { $, Expression, Executor, Dataset } from 'plywood';
import { SvgIcon } from '../svg-icon/svg-icon';
import { dataTransferTypesGet } from '../../utils/dom/dom';
import { Clicker, Essence, DataSource, Filter, Dimension, Measure } from '../../../common/models/index';
import { PinboardMeasureTile } from '../pinboard-measure-tile/pinboard-measure-tile';
import { DimensionTile } from '../dimension-tile/dimension-tile';

export interface PinboardPanelProps {
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
    var dimensionName = dataTransferTypesGet(e.dataTransfer.types, "dimension");
    if (dimensionName) {
      var pinnedDimensions = this.props.essence.pinnedDimensions;
      return !pinnedDimensions.has(dimensionName);
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
    var dimensionName = dataTransferTypesGet(e.dataTransfer.types, "dimension");
    if (dimensionName) {
      var { clicker, essence } = this.props;
      var dimension = essence.dataSource.getDimension(dimensionName);
      if (dimension) clicker.pin(dimension);
    }
    this.setState({ dragOver: false });
  }

  render() {
    var { clicker, essence } = this.props;
    var { dragOver } = this.state;
    var { dataSource, pinnedDimensions } = essence;

    var dimensionTiles = pinnedDimensions.toArray().map((dimensionName) => {
      var dimension = dataSource.getDimension(dimensionName);
      if (!dimension) return null;
      return JSX(`
        <DimensionTile
          key={dimension.name}
          clicker={clicker}
          essence={essence}
          dimension={dimension}
        />
      `);
    });

    var dropIndicatorTile: React.DOMElement<any> = null;
    if (dragOver) {
      dropIndicatorTile = JSX(`<div className="drop-indicator-tile"></div>`);
    }

    var placeholder: React.DOMElement<any> = null;
    if (!dragOver && !pinnedDimensions.size) {
      placeholder = JSX(`
        <div className="placeholder">
          <SvgIcon svg={require('../../icons/preview-pin.svg')}/>
          <div className="placeholder-message">Click or drag dimensions to pin them</div>
        </div>
      `);
    }

    return JSX(`
      <div
        className="pinboard-panel"
        onDragOver={this.dragOver.bind(this)}
        onDragEnter={this.dragEnter.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      >
        <PinboardMeasureTile clicker={clicker} essence={essence}/>
        {dimensionTiles}
        {dropIndicatorTile}
        {placeholder}
      </div>
    `);
  }
}
