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
import { ExpressionSeries } from "../../../common/models/series/expression-series";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { getXFromEvent, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems } from "../../utils/pill-tile/pill-tile";
import { AddSeries } from "./add-series";
import { DragIndicator } from "./drag-indicator";
import { SeriesTiles } from "./series-tiles";
import "./series-tiles-row.scss";

interface SeriesTilesRowProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface SeriesTilesRowState {
  dragPosition?: DragPosition;
  openedSeries?: Series;
  overflowOpen?: boolean;
  placeholderSeries?: Series;
}

export class SeriesTilesRow extends React.Component<SeriesTilesRowProps, SeriesTilesRowState> {

  state: SeriesTilesRowState = {};

  private maxItems(): number {
    const { menuStage, essence: { series } } = this.props;
    return menuStage && getMaxItems(menuStage.width, series.count());
  }

  // This will be called externally
  newExpressionSeries(measure: Measure) {
    this.setState({ placeholderSeries: ExpressionSeries.fromMeasure(measure) });
  }

  removePlaceholderSeries = () => this.setState({ placeholderSeries: null });

  openSeriesMenu = (series: Series) => this.setState({ openedSeries: series });

  closeSeriesMenu = () => this.setState({ openedSeries: null });

  openOverflowMenu = () => this.setState({ overflowOpen: true });

  closeOverflowMenu = () => this.setState({ overflowOpen: false });

  updateSeries = (oldSeries: Series, series: Series) => {
    const { essence, clicker } = this.props;
    clicker.changeSeriesList(essence.series.replaceSeries(oldSeries, series));
  }

  savePlaceholderSeries = (series: Series) => {
    const { clicker } = this.props;
    clicker.addSeries(series);
    this.removePlaceholderSeries();
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

    this.setState({ dragPosition: null });

    const newSeries: Series = DragManager.isDraggingSeries() ? DragManager.draggingSeries() : MeasureSeries.fromMeasure(DragManager.draggingMeasure());
    if (!newSeries) return;

    let dragPosition = this.calculateDragPosition(e);

    if (dragPosition.replace === this.maxItems()) {
      dragPosition = new DragPosition({ insert: dragPosition.replace });
    }

    if (dragPosition.isReplace()) {
      clicker.changeSeriesList(series.replaceByIndex(dragPosition.replace, newSeries));
    } else {
      clicker.changeSeriesList(series.insertByIndex(dragPosition.insert, newSeries));
    }
  }

  appendMeasureSeries = (measure: Measure) => {
    this.props.clicker.addSeries(MeasureSeries.fromMeasure(measure));
  }

  render() {
    const { dragPosition, openedSeries, overflowOpen, placeholderSeries } = this.state;
    const { menuStage, essence } = this.props;
    return <div className="series-tile" onDragEnter={this.dragEnter}>
      <div className="title">{STRINGS.series}</div>
      <div className="items" ref="items">
        <SeriesTiles
          menuStage={menuStage}
          placeholderSeries={placeholderSeries}
          maxItems={this.maxItems()}
          essence={essence}
          removeSeries={this.removeSeries}
          updateSeries={this.updateSeries}
          openSeriesMenu={this.openSeriesMenu}
          closeSeriesMenu={this.closeSeriesMenu}
          dragStart={this.dragStart}
          removePlaceholderSeries={this.removePlaceholderSeries}
          savePlaceholderSeries={this.savePlaceholderSeries}
          overflowOpen={overflowOpen}
          closeOverflowMenu={this.closeOverflowMenu}
          openOverflowMenu={this.openOverflowMenu}
          openedSeriesMenu={openedSeries} />
      </div>
      <AddSeries menuStage={menuStage} essence={essence} appendMeasureSeries={this.appendMeasureSeries} />
      <DragIndicator dragOver={this.dragOver} dragLeave={this.dragLeave} drop={this.drop} dragPosition={dragPosition} />
    </div>;
  }
}
