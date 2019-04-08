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

import { Bin } from "@vx/heatmap";
import * as React from "react";
import { HoveredHeatmapRectangle } from "./hovered-heatmap-rectangle";

interface Props {
  bin: Bin;
  hoveredRectangles: HoveredHeatmapRectangle;
}

interface State {
  hovered: boolean;
}

export class HeatMapRectangle extends React.Component<Props, State> {
  state = {
    hovered: false
  };

  componentDidMount() {
    const { hoveredRectangles, bin } = this.props;
    hoveredRectangles.onRectangleHover({ row: bin.row, column: bin.column }, {
      start: () => this.setState({ hovered: true }),
      end: () => this.setState({ hovered: false })
    });
  }

  render() {
    const { bin } = this.props;
    const { hovered } = this.state;
    return (
      <rect
        className={hovered ? "heatmap-rectangle-hovered" : ""}
        width={bin.width}
        height={bin.height}
        x={bin.y}
        y={bin.x}
        fill={bin.color}
        fillOpacity={bin.opacity}
      />
    );
  }
}
