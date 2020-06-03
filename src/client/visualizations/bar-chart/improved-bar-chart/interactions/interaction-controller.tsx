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

import { List } from "immutable";
import { Dataset, Datum } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { FilterClause } from "../../../../../common/models/filter-clause/filter-clause";
import { Binary, Nullary, Unary } from "../../../../../common/utils/functional/functional";
import { ScrollerPart } from "../../../../components/scroller/scroller";
import { Highlight } from "../../../base-visualization/highlight";
import { XScale } from "../utils/x-scale";
import { createHighlight, Hover, Interaction } from "./interaction";

interface InteractionProps {
  onClick?: (x: number, y: number, part: ScrollerPart) => void;
  onMouseMove?: (x: number, y: number, part: ScrollerPart) => void;
  onMouseLeave?: () => void;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
  interaction: Interaction | null;
}

interface InteractionControllerProps {
  xScale: XScale;
  essence: Essence;
  dataset: Dataset;
  children: Unary<InteractionProps, React.ReactNode>;
  highlight?: Highlight;
  saveHighlight: Binary<List<FilterClause>, string, void>;
  dropHighlight: Nullary<void>;
  acceptHighlight: Nullary<void>;
}

interface InteractionControllerState {
  hover?: Hover;
  scrollLeft: number;
  scrollTop: number;
}

export class InteractionController extends React.Component<InteractionControllerProps, InteractionControllerState> {

  state: InteractionControllerState = { hover: null, scrollLeft: 0, scrollTop: 0 };

  // calculateMousePosition(x: number, y: number): BubbleInfo {
  //   const { essence } = this.props;
  //
  //   const series = essence.getConcreteSeries();
  //   const chartStage = this.getSingleChartStage();
  //   const chartHeight = this.getOuterChartHeight(chartStage);
  //
  //   if (y >= chartHeight * series.size) return null; // on x axis
  //   if (x >= chartStage.width) return null; // on y axis
  //
  //   const xScale = this.getPrimaryXScale();
  //   const chartIndex = Math.floor(y / chartHeight);
  //
  //   const chartCoordinates = this.getBarsCoordinates(chartIndex, xScale);
  //
  //   const { path, coordinates } = this.findBarCoordinatesForX(x, chartCoordinates, []);
  //
  //   return {
  //     path: this.findPathForIndices(path),
  //     series: series.get(chartIndex),
  //     chartIndex,
  //     coordinates
  //   };
  // }
  //
  // findPathForIndices(indices: number[]): Datum[] {
  //   const { datasetLoad } = this.state;
  //   if (!isLoaded(datasetLoad)) return null;
  //   const mySplitDataset = datasetLoad.dataset.data[0][SPLIT] as Dataset;
  //
  //   const path: Datum[] = [];
  //   let currentData: Dataset = mySplitDataset;
  //   indices.forEach(i => {
  //     let datum = currentData.data[i];
  //     path.push(datum);
  //     currentData = (datum[SPLIT] as Dataset);
  //   });
  //
  //   return path;
  // }
  //
  // findBarCoordinatesForX(x: number, coordinates: BarCoordinates[], currentPath: number[]): { path: number[], coordinates: BarCoordinates } {
  //   for (let i = 0; i < coordinates.length; i++) {
  //     if (coordinates[i].isXWithin(x)) {
  //       currentPath.push(i);
  //       if (coordinates[i].hasChildren()) {
  //         return this.findBarCoordinatesForX(x, coordinates[i].children, currentPath);
  //       } else {
  //         return { path: currentPath, coordinates: coordinates[i] };
  //       }
  //     }
  //   }
  //
  //   return { path: [], coordinates: null };
  // }

  saveScroll = (scrollTop: number, scrollLeft: number) => {
    this.setState({
      hover: null,
      scrollLeft,
      scrollTop
    });
  };

  saveHover = (x: number, y: number, part: ScrollerPart) => {
    // TODO: implement
    this.setState({ hover: null });
  };

  resetHover = () => {
    this.setState({ hover: null });
  };

  handleClick = (x: number, y: number, part: ScrollerPart) => {
    this.getDatumFromEvent(x, y, part);
  };

  getDatumFromEvent(x: number, y: number, part: ScrollerPart): Datum | null {
    if (part !== "body") return null;
    return null;
  }

  // onClick = (x: number, y: number) => {
  //   const { essence } = this.props;
  //
  //   const selectionInfo = this.calculateMousePosition(x, y);
  //
  //   if (!selectionInfo) return;
  //
  //   if (!selectionInfo.coordinates) {
  //     this.dropHighlight();
  //     this.setState({ selectionInfo: null });
  //     return;
  //   }
  //
  //   const { path, chartIndex } = selectionInfo;
  //
  //   const { splits } = essence;
  //   const series = essence.getConcreteSeries();
  //
  //   const rowHighlight = getFilterFromDatum(splits, path);
  //
  //   const currentSeries = series.get(chartIndex).definition;
  //   if (this.highlightOn(currentSeries.key())) {
  //     const delta = this.getHighlightClauses();
  //     if (rowHighlight.equals(delta)) {
  //       this.dropHighlight();
  //       this.setState({ selectionInfo: null });
  //       return;
  //     }
  //   }
  //
  //   this.setState({ selectionInfo });
  //   this.highlight(rowHighlight, series.get(chartIndex).definition.key());
  // };

  interaction(): Interaction | null {
    const { highlight } = this.props;
    if (highlight) return createHighlight(highlight);
    return this.state.hover;
  }

  render() {
    const { children } = this.props;
    return children({
      interaction: this.interaction(),
      onScroll: this.saveScroll,
      onMouseLeave: this.resetHover,
      onMouseMove: this.saveHover,
      onClick: this.handleClick
    });
  }
}
