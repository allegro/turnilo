/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { Dataset, DatasetBreakdown } from "plywood";
import * as React from "react";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./heat-map.scss";
import { withTooltip, TooltipWithBounds } from '@vx/tooltip';
import { localPoint } from '@vx/event';
import { HEAT_MAP_MANIFEST } from "../../../common/manifests/heat-map/heat-map";
import { HeatMapRectangles } from "./heatmap-rectangles";
import { SPLIT } from "../../config/constants";
import { formatValue } from "../../../common/utils/formatter/formatter";
import { Scroller } from "../../components/scroller/scroller";
import { Essence } from "../../../common/models/essence/essence";

export class MouseHoverCoordinates {
  private callbacks: ((coordinates: { x: number; y: number; }) => void)[] = [];
  private coordinates: { x: number, y: number } = { x: 0, y: 0 };

  constructor(window: Window) {
    window.addEventListener("mousemove", e => {
      this.setCoordinates({
        x: e.clientX,
        y: e.clientY
      });
    });
  }

  private setCoordinates(coordinates: { x: number, y: number }) {
    this.coordinates = coordinates;
    this.callbacks.forEach(callback => callback(coordinates));
  }
  getCoordinates(): { x: number, y: number } {
    return this.coordinates;
  }
  onChange(callback: (coordinates: { x: number; y: number; }) => void) {
    this.callbacks.push(callback);

    return {
      unsubscribe: () => {
        this.callbacks = this.callbacks.filter(filteredCallback => filteredCallback !== callback);
      }
    };
  }
}

interface HeatMapWithoutTooltipProps {
  essence: Essence;
  dataset: Dataset;
  handleRectangleHover?(bin: any): void;
  hideTooltip?(): void;
  mouseHoverCoordinates?: MouseHoverCoordinates;
}

class HeatMapWithoutTooltip extends React.PureComponent<HeatMapWithoutTooltipProps> {
  render() {
    const { dataset, handleRectangleHover, hideTooltip, mouseHoverCoordinates } = this.props;
    const [measure] = this.props.essence.getEffectiveSelectedMeasures().toArray();
    const [firstSplit, secondSplit] = this.props.essence.splits.splits.toArray();
    const leftLabels = (dataset.data[0][SPLIT] as Dataset).data.map(datum => formatValue(datum[firstSplit.reference], this.props.essence.timezone, { formatOnlyStartDate: true }));
    const topLabels = ((dataset.data[0][SPLIT] as Dataset).data[0][SPLIT] as Dataset).data.map(datum => formatValue(datum[secondSplit.reference], this.props.essence.timezone, { formatOnlyStartDate: true }));

    return (
      <Scroller
        layout={{
          bodyHeight: leftLabels.length * 25,
          bodyWidth: topLabels.length * 25,
          top: 120,
          right: 0,
          bottom: 0,
          left: 200
        }}
        topGutter={
          <div className="top-labels">
            {topLabels.map(label => <span key={label as string}><span>{label}</span></span>)}
          </div>
        }
        leftGutter={
          <div className="left-labels">
            {leftLabels.map(label => <div key={label as string}><span>{label}</span></div>)}
          </div>
        }
        topLeftCorner={<div className="top-left-corner-mask" />}
        body={[
          <HeatMapRectangles onHover={handleRectangleHover} onHoverStop={hideTooltip} mouseHoverCoordinates={mouseHoverCoordinates} key="heat-map" data={dataset} measureName={measure.name} />
        ]}
      />
    );
  }
}

class UndecoratedHeatMap extends BaseVisualization<BaseVisualizationState> {
  protected className = HEAT_MAP_MANIFEST.name;
  private container: HTMLDivElement | null = null;
  private mouseHoverCoordinates = new MouseHoverCoordinates(window);

  handleRectangleHover = (bin: any) => {
    setTimeout(() => {
      if (!this.container) {
        return;
      }
      const { x, y } = this.mouseHoverCoordinates.getCoordinates();
      const { top, left, right, bottom } = this.container.getBoundingClientRect();

      if (!(left <= x && x <= right && top <= y && y <= bottom)) {
        (this.props as any).hideTooltip();
        return;
      }

      (this.props as any).showTooltip({
        tooltipLeft: x - left,
        tooltipTop: y - top,
        tooltipData: `Row: ${bin.column}, Column: ${bin.row}, Data: ${bin.count}`
      });
    }, 0);
  }

  renderInternals(dataset: Dataset) {
    const {
      tooltipData,
      tooltipLeft,
      tooltipTop,
      tooltipOpen,
      hideTooltip
    } = this.props as any;

    return <div ref={container => this.container = container} className="internals heatmap-container" style={{ maxHeight: this.props.stage.height }}>
      <HeatMapWithoutTooltip
        dataset={dataset}
        essence={this.props.essence}
        handleRectangleHover={this.handleRectangleHover}
        hideTooltip={hideTooltip}
        mouseHoverCoordinates={this.mouseHoverCoordinates}
      />
      {tooltipOpen && (
        <TooltipWithBounds
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <strong className="heatmap-tooltip">{tooltipData}</strong>
        </TooltipWithBounds>
      )}
    </div>;
  }
}

export const HeatMap = withTooltip(UndecoratedHeatMap, {
  style: {
    position: 'relative',
    height: '100%',
  }
});
