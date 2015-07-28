'use strict';

import React = require('react/addons');
import { List, OrderedSet } from 'immutable';
import { $, Expression, Dispatcher, NativeDataset } from 'plywood';
import { dataTransferTypesContain } from '../../utils/dom';
import { Clicker, DataSource, Filter, Dimension, Measure } from '../../models/index';
import { DimensionTile } from '../dimension-tile/dimension-tile';
import { MeasuresTile } from '../measures-tile/measures-tile';

interface PinboardPanelProps {
  clicker: Clicker;
  dataSource: DataSource;
  selectedMeasures: OrderedSet<string>;
  pinnedDimensions: OrderedSet<string>;
}

interface PinboardPanelState {
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

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps: PinboardPanelProps) {

  }

  canDrop(e: DragEvent) {
    if (dataTransferTypesContain(e.dataTransfer.types, "text/dimension")) {
      var dimensionName = e.dataTransfer.getData("text/dimension");
      var pinnedDimensions = this.props.pinnedDimensions;
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
    this.dragCounter = 0;
    var dimensionName = e.dataTransfer.getData("text/dimension");
    var { clicker, dataSource } = this.props;
    clicker.pinDimension(dataSource.getDimension(dimensionName));
    this.setState({ dragOver: false });
  }

  render() {
    var { clicker, dataSource, selectedMeasures, pinnedDimensions } = this.props;
    var { dragOver } = this.state;

    var dimensionTiles = pinnedDimensions.toArray().map((dimensionName) => {
      var dimension: Dimension = dataSource.getDimension(dimensionName);
      return JSX(`
        <DimensionTile
          key={dimension.name}
          clicker={clicker}
          dataSource={dataSource}
          dimension={dimension}
        />
      `);
    });

    var placeholderTile: React.DOMElement<any> = null;
    if (dragOver) {
      placeholderTile = JSX(`<div className="placeholder-tile"></div>`);
    }

    return JSX(`
      <div
        className="pinboard-panel"
        onDragOver={this.dragOver.bind(this)}
        onDragEnter={this.dragEnter.bind(this)}
        onDragLeave={this.dragLeave.bind(this)}
        onDrop={this.drop.bind(this)}
      >
        <MeasuresTile clicker={clicker} dataSource={dataSource} selectedMeasures={selectedMeasures}/>
        {dimensionTiles}
        {placeholderTile}
      </div>
    `);
  }
}
