/*
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
import * as ReactDOM from "react-dom";
import { Clicker } from "../../../common/models/clicker/clicker";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Deferred } from "../../../common/utils/promise/promise";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { getXFromEvent, setDragData, setDragGhost, transformStyle } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems, SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { AddTile } from "../add-tile/add-tile";
import { FancyDragIndicator } from "../fancy-drag-indicator/fancy-drag-indicator";
import { Item, SeriesItem } from "./series-item";
import { SeriesItemOverflow } from "./series-item-overflow";
import "./series-tile.scss";

export const SERIES_CLASS_NAME = "series";

interface SeriesTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface SeriesTileState {
  dragPosition?: DragPosition;
  openSeriesMenu?: Series;
  overflowOpen?: boolean;
  maxItems?: number;
}

export class SeriesTile extends React.Component<SeriesTileProps, SeriesTileState> {

  state: SeriesTileState = {};

  componentWillReceiveProps(nextProps: SeriesTileProps) {
    const { menuStage, essence } = nextProps;
    const { splits } = essence;

    if (menuStage) {
      const newMaxItems = getMaxItems(menuStage.width, splits.splits.count());
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          overflowOpen: false,
          maxItems: newMaxItems
        });
      }
    }
  }

  // This will be called externally
  triggerSeriesMenu(measure: Measure) {
    this.appendSeries(measure);
    const series = MeasureSeries.fromMeasure(measure);
    this.openSeriesMenu(series);
  }

  openSeriesMenu = (series: Series) => this.setState({ openSeriesMenu: series });

  closeSeriesMenu = () => this.setState({ openSeriesMenu: null });

  openOverflowMenu = () => this.setState({ overflowOpen: true });

  closeOverflowMenu = () => this.setState({ overflowOpen: false });

  saveSeries = (series: Series) => {
    const { essence, clicker } = this.props;
    clicker.changeSeriesList(essence.series.modifySeries(series));
  }

  removeSeries = (series: Series) => {
    const { clicker } = this.props;
    clicker.removeSeries(series);
    this.closeOverflowMenu();
  }

  canDrop(): boolean {
    const { essence: { series: seriesList } } = this.props;
    const measure = DragManager.draggingMeasure();
    if (measure) return !seriesList.hasMeasure(measure);
    return DragManager.isDraggingSeries();
  }

  dragStart = (label: string, series: Series, e: React.DragEvent<HTMLElement>) => {
    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    setDragData(dataTransfer, "text/plain", label);

    DragManager.setDragSeries(series);
    setDragGhost(dataTransfer, label);

    this.closeOverflowMenu();
  }

  calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition {
    const { essence } = this.props;
    const numItems = essence.series.count();
    const rect = ReactDOM.findDOMNode(this.refs["items"]).getBoundingClientRect();
    const x = getXFromEvent(e);
    const offset = x - rect.left;
    return DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({
      dragPosition: this.calculateDragPosition(e)
    });
  }

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  }

  dragLeave = () => {
    if (!this.canDrop()) return;
    this.setState({
      dragPosition: null
    });
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const { clicker, essence: { series } } = this.props;
    const { maxItems } = this.state;

    this.setState({ dragPosition: null });

    const newSeries: Series = DragManager.isDraggingSeries() ? DragManager.draggingSeries() : MeasureSeries.fromMeasure(DragManager.draggingMeasure());
    if (!newSeries) return;

    let dragPosition = this.calculateDragPosition(e);

    if (dragPosition.replace === maxItems) {
      dragPosition = new DragPosition({ insert: dragPosition.replace });
    }

    if (dragPosition.isReplace()) {
      clicker.changeSeriesList(series.replaceByIndex(dragPosition.replace, newSeries));
    } else {
      clicker.changeSeriesList(series.insertByIndex(dragPosition.insert, newSeries));
    }
  }

  appendSeries = (measure: Measure) => {
    this.props.clicker.addSeries(MeasureSeries.fromMeasure(measure));
  }

  renderAddTileButton() {
    const { menuStage, essence: { dataCube, series } } = this.props;
    const tiles = dataCube.measures
      .filterMeasures(measure => !series.hasMeasure(measure))
      .map(measure => {
        return {
          key: measure.name,
          label: measure.title,
          value: measure
        };
      });

    return <AddTile<Measure> containerStage={menuStage} onSelect={this.appendSeries} tiles={tiles} />;
  }

  renderItem = (item: Item): JSX.Element => {
    const { menuStage } = this.props;
    const { series } = item;

    return <SeriesItem
      key={series.key()}
      item={item}
      closeSeriesMenu={this.closeSeriesMenu}
      removeSeries={this.removeSeries}
      dragStart={this.dragStart}
      containerStage={menuStage}
      openSeriesMenu={this.openSeriesMenu}
      saveSeries={this.saveSeries} />;
  }

  renderItems() {
    const { essence: { series, dataCube } } = this.props;
    const { overflowOpen, openSeriesMenu, maxItems } = this.state;

    const seriesItems: Item[] = series.series.toArray().map(series => {
      const measure = dataCube.getMeasure(series.reference);
      const open = openSeriesMenu && series.equals(openSeriesMenu);
      return { series, measure, open };
    });

    const visibleItems = seriesItems
      .slice(0, maxItems)
      .map(this.renderItem)
      .map((element, idx) => React.cloneElement(element, { style: transformStyle(idx * SECTION_WIDTH, 0) }));

    const overflowItems = seriesItems.slice(maxItems);
    if (overflowItems.length <= 0) return visibleItems;

    const overflowOpened = overflowOpen || overflowItems.some(item => item.open);
    const seriesItemOverflow = <SeriesItemOverflow
      key="overflow-menu"
      items={overflowItems.map(this.renderItem)}
      open={overflowOpened}
      openOverflowMenu={this.openOverflowMenu}
      x={visibleItems.length * SECTION_WIDTH}
      closeOverflowMenu={this.closeOverflowMenu}/>;

    return [...visibleItems, seriesItemOverflow];
  }

  renderDragIndicator() {
    const { dragPosition } = this.state;
    return dragPosition && <React.Fragment>
      <FancyDragIndicator dragPosition={dragPosition} />
      <div className="drag-mask"
           onDragOver={this.dragOver}
           onDragLeave={this.dragLeave}
           onDragExit={this.dragLeave}
           onDrop={this.drop} />
    </React.Fragment>;
  }

  render() {
    return <div className="series-tile" onDragEnter={this.dragEnter}>
      <div className="title">{STRINGS.series}</div>
      <div className="items" ref="items">{this.renderItems()}</div>
      {this.renderAddTileButton()}
      {this.renderDragIndicator()}
    </div>;
  }

}
