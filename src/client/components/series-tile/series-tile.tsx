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

import * as Q from "q";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Clicker } from "../../../common/models/clicker/clicker";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { ExpressionSeriesDefinition, fromMeasure, MeasureSeriesDefinition, QuantileSeriesDefinition, SeriesDefinition } from "../../../common/models/series/series-definition";
import { Stage } from "../../../common/models/stage/stage";
import { concatTruthy } from "../../../common/utils/functional/functional";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { classNames, findParentWithClass, getXFromEvent, isInside, setDragGhost, transformStyle, uniqueId } from "../../utils/dom/dom";
import { DragManager, MeasureOrigin, SeriesOrigin } from "../../utils/drag-manager/drag-manager";
import { getMaxItems, SECTION_WIDTH } from "../../utils/pill-tile/pill-tile";
import { AddTile } from "../add-tile/add-tile";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { FancyDragIndicator } from "../fancy-drag-indicator/fancy-drag-indicator";
import { SeriesMenu } from "../series-menu/series-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./series-tile.scss";

const SERIES_CLASS_NAME = "series";

interface SeriesTileProps {
  clicker: Clicker;
  essence: Essence;
  menuStage: Stage;
}

interface SeriesTileState {
  dragPosition?: DragPosition;
  possibleSeries?: SeriesDefinition;
  overflowMenuOpenOn?: Element;
  maxItems?: number;
  menuInside?: Element;
  menuSeries?: SeriesDefinition;
  menuOpenOn?: Element;
}

export class SeriesTile extends React.Component<SeriesTileProps, SeriesTileState> {

  private readonly overflowMenuId = uniqueId("overflow-menu-");
  private dummyDeferred: Q.Deferred<void>;
  private overflowMenuDeferred: Q.Deferred<Element>;

  state: SeriesTileState = {};

  componentWillReceiveProps(nextProps: SeriesTileProps) {
    const { menuStage, essence } = nextProps;
    const { splits } = essence;

    if (menuStage) {
      const newMaxItems = getMaxItems(menuStage.width, splits.splits.count());
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          menuOpenOn: null,
          overflowMenuOpenOn: null,
          possibleSeries: null,
          maxItems: newMaxItems
        });
      }
    }
  }

  componentDidUpdate() {
    const { possibleSeries, overflowMenuOpenOn } = this.state;

    if (possibleSeries) {
      this.dummyDeferred.resolve(null);
    }

    if (overflowMenuOpenOn) {
      const overflowMenu = this.getOverflowMenu();
      if (overflowMenu) this.overflowMenuDeferred.resolve(overflowMenu);
    }
  }

  getOverflowMenu(): Element {
    return document.getElementById(this.overflowMenuId);
  }

  openOverflowMenu(target: Element): Q.Promise<Element> {
    if (!target) return Q(null);
    const { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn === target) {
      this.closeOverflowMenu();
      return Q(null);
    }

    this.overflowMenuDeferred = Q.defer<Element>();
    this.setState({ overflowMenuOpenOn: target });
    return this.overflowMenuDeferred.promise;
  }

  closeOverflowMenu = () => {
    const { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return;
    this.setState({
      overflowMenuOpenOn: null
    });
  }

  toggleMenu(series: SeriesDefinition, target: Element) {
    const { menuOpenOn } = this.state;
    if (menuOpenOn === target) {
      this.closeMenu();
      return;
    }

    this.openMenu(series, target);
  }

  openMenu(series: SeriesDefinition, target: Element) {
    const overflowMenu = this.getOverflowMenu();
    const menuInside = overflowMenu && isInside(target, overflowMenu) ? overflowMenu : null;

    this.setState({
      menuOpenOn: target,
      menuSeries: series,
      menuInside
    });
  }

  closeMenu = () => {
    const { possibleSeries, menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    const newState: SeriesTileState = {
      menuOpenOn: null,
      menuInside: null,
      menuSeries: null,
      possibleSeries: null
    };
    if (possibleSeries) {
      // If we are adding a ghost series also close the overflow menu
      // This is so it does not remain phantom open with nothing inside
      this.setState({ ...newState, overflowMenuOpenOn: null });
      return;
    }
    this.setState(newState);
  }

  selectSeries = (series: SeriesDefinition, e: React.MouseEvent<HTMLElement>) => {
    const target = findParentWithClass(e.target as Element, SERIES_CLASS_NAME);
    this.toggleMenu(series, target);
  }

  removeSeries = (series: SeriesDefinition, e: React.MouseEvent<HTMLElement>) => {
    const { clicker } = this.props;
    clicker.removeSeries(series);
    this.closeOverflowMenu();
    e.stopPropagation();
  }

  canDrop(): boolean {
    const series = DragManager.draggingSeries();
    if (series) return true;

    const measure = DragManager.draggingMeasure();
    if (measure && DragManager.dragging.origin === MeasureOrigin.SERIES_TILE) return true;
    if (measure && !this.props.essence.series.hasSeriesForMeasure(measure)) return true;
    return false;
  }

  dragStart = (series: SeriesDefinition, e: React.DragEvent<HTMLElement>) => {
    const measure = this.props.essence.dataCube.getMeasure(series.reference);

    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    // TODO: Series.title or smthing
    dataTransfer.setData("text/plain", measure.title);
    setDragGhost(dataTransfer, measure.title);
    if (series instanceof ExpressionSeriesDefinition) {
      DragManager.setDragSeries(series, SeriesOrigin.SERIES_TILE);
    } else {
      DragManager.setDragMeasure(measure, MeasureOrigin.SERIES_TILE);
    }
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
    e.dataTransfer.dropEffect = "move";
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (dragPosition.equals(this.state.dragPosition)) return;
    this.setState({ dragPosition });
  }

  dragLeave = () => {
    if (!this.canDrop()) return;
    this.setState({ dragPosition: null });
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const dragPosition = this.calculateDragPosition(e);
    if (DragManager.isDraggingSeries()) {
      this.dropSeries(DragManager.draggingSeries(), dragPosition);
      return;
    }
    if (DragManager.isDraggingMeasure()) {
      this.dropSeries(MeasureSeriesDefinition.fromMeasure(DragManager.draggingMeasure()), dragPosition);
      return;
    }
  }

  private dropSeries(series: SeriesDefinition, dragPosition: DragPosition) {
    const { clicker, essence: { series: seriesList } } = this.props;
    const { maxItems } = this.state;
    if (dragPosition.replace === maxItems) {
      dragPosition = new DragPosition({ insert: dragPosition.replace });
    }

    if (dragPosition.isReplace()) {
      clicker.changeSeriesList(seriesList.replaceByIndex(dragPosition.replace, series));
    } else {
      clicker.changeSeriesList(seriesList.insertByIndex(dragPosition.insert, series));
    }
    this.setState({ dragPosition: null });
  }

  addMeasure = (measure: Measure) => {
    const series = fromMeasure(measure);
    if (series instanceof QuantileSeriesDefinition) {
      this.addDummy(series);
    } else {
      this.props.clicker.addSeries(series);
    }
  }

  updateSeries = (series: SeriesDefinition) => {
    const { menuSeries, possibleSeries } = this.state;
    const { essence, clicker } = this.props;

    if (!possibleSeries) {
      clicker.changeSeriesList(essence.series.replaceSeries(menuSeries, series));
      return;
    }
    clicker.addSeries(series);
  }

  openMenuOnSeries(series: SeriesDefinition) {
    const targetRef = this.refs[series.key()];
    if (targetRef) {
      const target = ReactDOM.findDOMNode(targetRef);
      if (!target) return;
      this.openMenu(series, target);
    } else {
      const overflowButtonTarget = this.overflowButtonTarget();
      if (overflowButtonTarget) {
        this.openOverflowMenu(overflowButtonTarget).then(() => {
          const target = ReactDOM.findDOMNode(this.refs[series.key()]);
          if (!target) return;
          this.openMenu(series, target);
        });
      }
    }
  }

  // This will be called externally
  seriesMenuRequest(series: SeriesDefinition) {
    this.addDummy(series);
  }

  addDummy(possibleSeries: SeriesDefinition) {
    this.dummyDeferred = Q.defer();
    this.setState({ possibleSeries });
    this.dummyDeferred.promise.then(() => {
      this.openMenuOnSeries(possibleSeries);
    });
  }

  overflowButtonTarget(): Element {
    return ReactDOM.findDOMNode(this.refs["overflow"]);
  }

  overflowButtonClick = () => {
    this.openOverflowMenu(this.overflowButtonTarget());
  }

  renderOverflowMenu(items: SeriesDefinition[]): JSX.Element {
    const { overflowMenuOpenOn } = this.state;
    if (!overflowMenuOpenOn) return null;

    const segmentHeight = 29 + CORE_ITEM_GAP;

    const seriesItems = items.map((item, i) => {
      const style = transformStyle(0, CORE_ITEM_GAP + i * segmentHeight);
      return this.renderSeries(item, style);
    });

    return <BubbleMenu
      className="overflow-menu"
      id={this.overflowMenuId}
      direction="down"
      stage={Stage.fromSize(208, CORE_ITEM_GAP + (seriesItems.length * segmentHeight))}
      fixedSize={true}
      openOn={overflowMenuOpenOn}
      onClose={this.closeOverflowMenu}
    >
      {seriesItems}
    </BubbleMenu>;
  }

  renderOverflow(items: SeriesDefinition[], itemX: number): JSX.Element {
    const style = transformStyle(itemX, 0);
    return <React.Fragment key="overflow">
      <div
        className="overflow measure"
        ref="overflow"
        style={style}
        onClick={this.overflowButtonClick}
      >
        <div className="count">{"+" + items.length}</div>
      </div>
      {this.renderOverflowMenu(items)}
    </React.Fragment>;
  }

  renderSeries(series: SeriesDefinition, style: React.CSSProperties) {
    const { essence: { dataCube } } = this.props;

    const measure = dataCube.getMeasure(series.reference);
    if (!measure) throw new Error("measure not found");
    // TODO: title from series
    const title = measure.title;

    const key = series.key();
    const expression = series instanceof ExpressionSeriesDefinition;
    return <div
      className={classNames(SERIES_CLASS_NAME, "measure", { expression })}
      key={key}
      ref={key}
      draggable={true}
      onClick={(e: React.MouseEvent<HTMLElement>) => this.selectSeries(series, e)}
      onDragStart={(e: React.DragEvent<HTMLElement>) => this.dragStart(series, e)}
      style={style}
    >
      <div className="reading">{title}</div>
      <div className="remove"
           onClick={(e: React.MouseEvent<HTMLElement>) => this.removeSeries(series, e)}>
        <SvgIcon svg={require("../../icons/x.svg")} />
      </div>
    </div>;
  }

  renderAddTileButton() {
    const { menuStage, essence: { dataCube, series } } = this.props;
    const tiles = dataCube.measures
      .filterMeasures(measure => !series.hasSeriesForMeasure(measure))
      .map(measure => {
        return {
          key: measure.name,
          label: measure.title,
          value: measure
        };
      });

    return <AddTile<Measure>
      containerStage={menuStage}
      onSelect={this.addMeasure}
      tiles={tiles} />;
  }

  renderMenu() {
    const { essence, menuStage } = this.props;
    const { menuOpenOn, menuSeries, menuInside, overflowMenuOpenOn } = this.state;
    if (!menuSeries) return null;

    return <SeriesMenu
      onSave={this.updateSeries}
      dataCube={essence.dataCube}
      containerStage={overflowMenuOpenOn ? null : menuStage}
      openOn={menuOpenOn}
      series={menuSeries}
      onClose={this.closeMenu}
      inside={menuInside}
    />;
  }

  getSeriesItems() {
    const { essence: { series: { series } } } = this.props;
    const { possibleSeries } = this.state;

    return concatTruthy(...series.toArray(), possibleSeries);
  }

  render() {
    const { dragPosition, maxItems } = this.state;

    const seriesArray = this.getSeriesItems();

    const seriesItems = seriesArray.slice(0, maxItems).map((series, i) => {
      const style = transformStyle(i * SECTION_WIDTH, 0);
      return this.renderSeries(series, style);
    }, this);

    const overflowItems = seriesArray.slice(maxItems);
    if (overflowItems.length > 0) {
      const overFlowStart = seriesItems.length * SECTION_WIDTH;
      seriesItems.push(this.renderOverflow(overflowItems, overFlowStart));
    }

    return <div
      className="series-tile"
      onDragEnter={this.dragEnter}
    >
      <div className="title">{STRINGS.series}</div>
      <div className="items" ref="items">
        {seriesItems}
      </div>
      {this.renderAddTileButton()}
      {dragPosition ? <FancyDragIndicator dragPosition={dragPosition} /> : null}
      {dragPosition ? <div
        className="drag-mask"
        onDragOver={this.dragOver}
        onDragLeave={this.dragLeave}
        onDragExit={this.dragLeave}
        onDrop={this.drop}
      /> : null}
      {this.renderMenu()}
    </div>;
  }
}
