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

require('./collection-tile-card.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SvgIcon, GlobalEventListener } from '../../../components/index';
import { classNames } from '../../../utils/dom/dom';

import { STRINGS } from '../../../config/constants';

import { Collection, CollectionTile, VisualizationProps, Stage, Timekeeper, Device, DeviceSize } from '../../../../common/models/index';

import { getVisualizationComponent } from '../../../visualizations/index';

export interface CollectionTileCardProps extends React.Props<any> {
  tile: CollectionTile;
  timekeeper: Timekeeper;
  className?: string;
  onExpand?: (tile: CollectionTile) => void;
  onDelete?: (tile: CollectionTile) => void;

  editionMode?: boolean;
  onDragOver?: (e: __React.DragEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: __React.DragEvent) => void;
}

export interface CollectionTileCardState {
  visualizationStage?: Stage;
  deviceSize?: DeviceSize;
}

export class CollectionTileCard extends React.Component<CollectionTileCardProps, CollectionTileCardState> {
  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {
    this.updateVisualizationStage();
  }

  updateVisualizationStage() {
    var { visualization } = this.refs;
    var visualizationDOM = ReactDOM.findDOMNode(visualization);

    if (!visualizationDOM) return;

    this.setState({
      deviceSize: Device.getSize(),
      visualizationStage: Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
    });
  }

  expand() {
    const { onExpand, tile } = this.props;

    if (!onExpand) return;

    onExpand(tile);
  }

  remove() {
    const { onDelete, tile } = this.props;

    if (!onDelete) return;

    onDelete(tile);
  }

  render() {
    const { tile, timekeeper, onDragOver, draggable, onDragStart, editionMode, className } = this.props;
    const { visualizationStage, deviceSize } = this.state;

    if (!tile) return null;

    var { essence } = tile;

    var visElement: JSX.Element = null;
    if (essence.visResolve.isReady() && visualizationStage) {

      // Forcing single measure mode
      if (essence.getEffectiveMultiMeasureMode()) {
        essence = essence.toggleMultiMeasureMode();
      }

      var visProps: VisualizationProps = {
        clicker: {},
        essence,
        timekeeper,
        stage: visualizationStage,
        deviceSize,
        isThumbnail: true
      };

      visElement = React.createElement(
        getVisualizationComponent(essence.visualization),
        visProps
      );
    }

    const onExpandClick = () => {
      if (editionMode) return;
      this.expand();
    };

    return <div
      className={classNames("collection-tile-card", {editing: editionMode}, className)}
      onDragOver={onDragOver}
      draggable={draggable}
      onDragStart={onDragStart}
    >
        <GlobalEventListener
          resize={this.updateVisualizationStage.bind(this)}
        />

        <div className="headband grid-row" onClick={onExpandClick}>
          <div className="grid-col-80 vertical">
            <div className="title">{tile.title}</div>
            <div className="description">{tile.description || STRINGS.noDescription}</div>
          </div>
          <div className="grid-col-20 middle right">
          { editionMode ?
            <div className="delete-button" onClick={this.remove.bind(this)}>
              <SvgIcon svg={require(`../../../icons/full-delete.svg`)}/>
            </div>
          :
            <div className="expand-button">
              <SvgIcon svg={require(`../../../icons/full-expand.svg`)}/>
            </div>
          }
          </div>
        </div>
        <div className="content" ref="visualization">
          {visElement}
        </div>
    </div>;
  }
}
