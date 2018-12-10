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
import { SeriesDefinition } from "../../../common/models/series/series-definition";
import { Stage } from "../../../common/models/stage/stage";
import { CORE_ITEM_GAP, CORE_ITEM_WIDTH, STRINGS } from "../../config/constants";
import { classNames, findParentWithClass, getXFromEvent, isInside, setDragGhost, transformStyle, uniqueId } from "../../utils/dom/dom";
import { DragManager, MeasureOrigin } from "../../utils/drag-manager/drag-manager";
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
  overflowMenuOpenOn?: Element;
  maxItems?: number;
  menuInside?: Element;
  menuSeries?: SeriesDefinition;
  menuOpenOn?: Element;
}

export class SeriesTile extends React.Component<SeriesTileProps, SeriesTileState> {

  private readonly overflowMenuId = uniqueId("overflow-menu-");
  private overflowMenuDeferred: Q.Deferred<Element>;

  state: SeriesTileState = {};

  componentWillReceiveProps(nextProps: SeriesTileProps) {
    const { menuStage, essence } = nextProps;
    const { splits } = essence;

    if (menuStage) {
      const newMaxItems = getMaxItems(menuStage.width, splits.splits.count());
      if (newMaxItems !== this.state.maxItems) {
        this.setState({
          overflowMenuOpenOn: null,
          maxItems: newMaxItems
        });
      }
    }

  }

  componentDidUpdate() {
    const { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn) {
      const overflowMenu = this.getOverflowMenu();
      if (overflowMenu) this.overflowMenuDeferred.resolve(overflowMenu);
    }
  }

  getOverflowMenu(): Element {
    return document.getElementById(this.overflowMenuId);
  }

  openOverflowMenu(target: Element): Q.Promise<any> {
    if (!target) return Q(null);
    const { overflowMenuOpenOn } = this.state;

    if (overflowMenuOpenOn === target) {
      this.closeOverflowMenu();
      return Q(null);
    }

    this.overflowMenuDeferred = Q.defer() as Q.Deferred<Element>;
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
    const { menuOpenOn } = this.state;
    if (!menuOpenOn) return;
    this.setState({
      menuOpenOn: null,
      menuInside: null,
      menuSeries: null
    });
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
    const { essence: { series } } = this.props;
    const measure = DragManager.draggingMeasure();
    if (!measure) return false;
    const origin = DragManager.dragging.origin;
    return origin === MeasureOrigin.SERIES_TILE || !series.hasMeasure(measure);
  }

  dragStart = (measure: Measure, series: SeriesDefinition, splitIndex: number, e: React.DragEvent<HTMLElement>) => {
    const dataTransfer = e.dataTransfer;
    dataTransfer.effectAllowed = "all";
    dataTransfer.setData("text/plain", measure.title);

    DragManager.setDragMeasure(measure, MeasureOrigin.SERIES_TILE);
    setDragGhost(dataTransfer, measure.title);

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
    this.setState({
      dragPosition: null
    });
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    if (!this.canDrop()) return;
    e.preventDefault();
    const { clicker, essence: { series } } = this.props;
    const { maxItems } = this.state;

    const newSeries: SeriesDefinition = SeriesDefinition.fromMeasure(DragManager.draggingMeasure());

    if (newSeries) {
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

    this.setState({
      dragPosition: null
    });
  }

  appendSeries = (measure: Measure) => {
    this.props.clicker.addSeries(SeriesDefinition.fromMeasure(measure));
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
      return this.renderSeries(item, style, i);
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
    return <div
      className="overflow measure"
      ref="overflow"
      key="overflow"
      style={style}
      onClick={this.overflowButtonClick}
    >
      <div className="count">{"+" + items.length}</div>
      {this.renderOverflowMenu(items)}
    </div>;
  }

  renderSeries(series: SeriesDefinition, style: React.CSSProperties, i: number) {
    const { essence: { dataCube } } = this.props;

    const measure = dataCube.getMeasure(series.reference);
    if (!measure) throw new Error("measure not found");
    const dimensionName = measure.name;

    return <div
      className={classNames(SERIES_CLASS_NAME, "measure")}
      key={measure.name}
      ref={dimensionName}
      draggable={true}
      onClick={(e: React.MouseEvent<HTMLElement>) => this.selectSeries(series, e)}
      onDragStart={(e: React.DragEvent<HTMLElement>) => this.dragStart(measure, series, i, e)}
      style={style}
    >
      <div className="reading">{measure.title}</div>
      <div className="remove"
           onClick={(e: React.MouseEvent<HTMLElement>) => this.removeSeries(series, e)}>
        <SvgIcon svg={require("../../icons/x.svg")} />
      </div>
    </div>;
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

  renderMenu() {
    const { essence, clicker, menuStage } = this.props;
    const { menuOpenOn, menuSeries, menuInside, overflowMenuOpenOn } = this.state;
    if (!menuSeries) return null;

    const measure = essence.dataCube.measures.getMeasureByName(menuSeries.reference);

    return <SeriesMenu
      clicker={clicker}
      essence={essence}
      containerStage={overflowMenuOpenOn ? null : menuStage}
      openOn={menuOpenOn}
      series={menuSeries}
      onClose={this.closeMenu}
      inside={menuInside}
    />;
  }

  render() {
    const { essence: { series } } = this.props;
    const { dragPosition, maxItems } = this.state;

    const seriesArray = series.series.toArray();

    const seriesItems = seriesArray.slice(0, maxItems).map((serie, i) => {
      const style = transformStyle(i * SECTION_WIDTH, 0);
      return this.renderSeries(serie, style, i);
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
