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

import React from "react";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Measure } from "../../../common/models/measure/measure";
import { MeasureSeries } from "../../../common/models/series/measure-series";
import { QuantileSeries } from "../../../common/models/series/quantile-series";
import { fromMeasure, Series } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Binary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { getXFromEvent, setDragData, setDragGhost } from "../../utils/dom/dom";
import { DragManager } from "../../utils/drag-manager/drag-manager";
import { getMaxItems } from "../../utils/pill-tile/pill-tile";
import { CubeContext, CubeContextValue } from "../../views/cube-view/cube-context";
import { PartialSeries } from "../../views/cube-view/partial-tiles-provider";
import { DragIndicator } from "../drag-indicator/drag-indicator";
import { AddSeries } from "./add-series";
import { SeriesTiles } from "./series-tiles";

interface SeriesTilesRowProps {
  menuStage: Stage;
  partialSeries: PartialSeries | null;
  addPartialSeries: Binary<Series, DragPosition, void>;
  removePartialSeries: Fn;
}

interface SeriesTilesRowState {
  dragPosition?: DragPosition;
  openedSeries?: Series;
  overflowOpen?: boolean;
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

  openSeriesMenu = (series: Series) => this.setState({ openedSeries: series });

  closeSeriesMenu = () => this.setState({ openedSeries: null });

  openOverflowMenu = () => this.setState({ overflowOpen: true });

  closeOverflowMenu = () => this.setState({ overflowOpen: false });

  updateSeries = (oldSeries: Series, series: Series) => {
    const { essence, clicker } = this.context;
    clicker.changeSeriesList(essence.series.replaceSeries(oldSeries, series));
  };

  savePlaceholderSeries = (series: Series) => {
    const { removePartialSeries } = this.props;
    const { clicker } = this.context;
    clicker.addSeries(series);
    removePartialSeries();
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
      return DragPosition.insertAt(position.replace);
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
    const { addPartialSeries } = this.props;
    const { clicker, essence: { series } } = this.context;
    const isDuplicateQuantile = newSeries instanceof QuantileSeries && series.hasSeries(newSeries);
    if (isDuplicateQuantile) {
      if (dragPosition.isReplace()) {
        clicker.removeSeries(series.series.get(dragPosition.replace));
        addPartialSeries(newSeries, dragPosition);
      } else {
        addPartialSeries(newSeries, dragPosition);
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
    const { addPartialSeries } = this.props;
    const { clicker, essence } = this.context;
    const series = fromMeasure(measure);
    const isMeasureSeries = series instanceof MeasureSeries;
    const isUniqueQuantile = series instanceof QuantileSeries && !this.context.essence.series.hasSeries(series);
    if (isMeasureSeries || isUniqueQuantile) {
      clicker.addSeries(series);
    } else {
      addPartialSeries(series, DragPosition.insertAt(essence.series.count()));
    }
  };

  render() {
    const { dragPosition, openedSeries, overflowOpen } = this.state;
    const { essence } = this.context;
    const { menuStage, removePartialSeries, partialSeries } = this.props;
    return <div className="tile-row series-tile-row" onDragEnter={this.dragEnter}>
      <div className="title">{STRINGS.series}</div>
      <div className="items" ref={this.items}>
        <SeriesTiles
          menuStage={menuStage}
          partialSeries={partialSeries}
          maxItems={this.maxItems()}
          essence={essence}
          removeSeries={this.removeSeries}
          updateSeries={this.updateSeries}
          openSeriesMenu={this.openSeriesMenu}
          closeSeriesMenu={this.closeSeriesMenu}
          dragStart={this.dragStart}
          removePlaceholderSeries={removePartialSeries}
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
