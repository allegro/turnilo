/*
 * Copyright 2017-2019 Allegro.pl
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
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { QuantileSeries } from "../../../common/models/series/quantile-series";
import { fromMeasure, Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { getXFromEvent, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems } from "../../utils/pill-tile/pill-tile";
import { CubeContext, CubeContextValue } from "../../views/cube-view/cube-context";
import { DragIndicator } from "../drag-indicator/drag-indicator";
import { AddSeries } from "./add-series";
import { SeriesTiles } from "./series-tiles";
import "./series-tiles-row.scss";

interface SeriesTilesRowProps {
  menuStage: Stage;
}

export interface Placeholder {
  series: Series;
  index: number;
}

interface SeriesTilesRowState {
  dragPosition?: DragPosition;
  openedSeries?: Series;
  overflowOpen?: boolean;
  placeholderSeries?: Placeholder;
}

export class SeriesTilesRow extends React.Component<SeriesTilesRowProps, SeriesTilesRowState> {
  static contextType = CubeContext;
  context: CubeContextValue;

  state: SeriesTilesRowState = {};
  private items = React.createRef<HTMLDivElement>();

  private maxItems(): number {
    const { essence: { series } } = this.context;
    const { menuStage } = this.props;
    return menuStage && getMaxItems(menuStage.width, series.count());
  }

  // This will be called externally
  appendDirtySeries(series: Series) {
    this.appendPlaceholder(series);
  }

  private appendPlaceholder(series: Series) {
    this.setState({
      placeholderSeries: {
        series,
        index: this.context.essence.series.count()
      }
    });
  }

  removePlaceholderSeries = () => this.setState({ placeholderSeries: null });

  openSeriesMenu = (series: Series) => this.setState({ openedSeries: series });

  closeSeriesMenu = () => this.setState({ openedSeries: null });

  openOverflowMenu = () => this.setState({ overflowOpen: true });

  closeOverflowMenu = () => this.setState({ overflowOpen: false });

  updateSeries = (oldSeries: Series, series: Series) => {
    const { essence, clicker } = this.context;
    clicker.changeSeriesList(essence.series.replaceSeries(oldSeries, series));
  };

  savePlaceholderSeries = (series: Series) => {
    const { clicker } = this.context;
    clicker.addSeries(series);
    this.removePlaceholderSeries();
  };

  removeSeries = (series: Series) => {
    const { clicker } = this.context;
    clicker.removeSeries(series);
    this.closeOverflowMenu();
  };

  canDrop(): boolean {
    const { essence: { series: seriesList } } = this.context;
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
  };

  calculateDragPosition(e: React.DragEvent<HTMLElement>): DragPosition {
    const { essence } = this.context;
    const numItems = essence.series.count();
    const rect = this.items.current.getBoundingClientRect();
    const x = getXFromEvent(e);
    const offset = x - rect.left;
    const position = DragPosition.calculateFromOffset(offset, numItems, CORE_ITEM_WIDTH, CORE_ITEM_GAP);
    if (position.replace === this.maxItems()) {
      return new DragPosition({ insert: position.replace });
    }
    return position;
  }

  dragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({
      dragPosition: this.calculateDragPosition(e)
    });
  };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  };

  dragLeave = () => {
    if (!this.canDrop()) return;
    this.setState({
      dragPosition: null
    });
  };

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    this.setState({ dragPosition: null });

    if (DragManager.isDraggingSeries()) {
      this.rearrangeSeries(DragManager.draggingSeries(), this.calculateDragPosition(e));
    } else {
      this.dropNewSeries(fromMeasure(DragManager.draggingMeasure()), this.calculateDragPosition(e));
    }
  };

  private dropNewSeries(newSeries: Series, dragPosition: DragPosition) {
    const { clicker, essence: { series } } = this.context;
    const isDuplicateQuantile = newSeries instanceof QuantileSeries && series.hasSeries(newSeries);
    if (isDuplicateQuantile) {
      if (dragPosition.isReplace()) {
        clicker.removeSeries(series.series.get(dragPosition.replace));
        this.setState({ placeholderSeries: { series: newSeries, index: dragPosition.replace } });
      } else {
        this.setState({ placeholderSeries: { series: newSeries, index: dragPosition.insert } });
      }
    } else {
      this.rearrangeSeries(newSeries, dragPosition);
    }
  }

  private rearrangeSeries(series: Series, dragPosition: DragPosition) {
    const { clicker, essence } = this.context;

    if (dragPosition.isReplace()) {
      clicker.changeSeriesList(essence.series.replaceByIndex(dragPosition.replace, series));
    } else {
      clicker.changeSeriesList(essence.series.insertByIndex(dragPosition.insert, series));
    }
  }

  appendMeasureSeries = (measure: Measure) => {
    const series = fromMeasure(measure);
    const isMeasureSeries = series instanceof MeasureSeries;
    const isUniqueQuantile = !this.context.essence.series.hasSeries(series);
    if (isMeasureSeries || isUniqueQuantile) {
      this.context.clicker.addSeries(series);
      return;
    }
    this.appendPlaceholder(series);
  };

  render() {
    const { dragPosition, openedSeries, overflowOpen, placeholderSeries } = this.state;
    const { essence } = this.context;
    const { menuStage } = this.props;
    return <div className="series-tile" onDragEnter={this.dragEnter}>
      <div className="title">{STRINGS.series}</div>
      <div className="items" ref={this.items}>
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
