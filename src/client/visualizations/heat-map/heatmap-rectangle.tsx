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

import * as React from "react";

interface Props {
  bin: any;
}

export class HeatMapRectangle extends React.Component<Props> {
  render() {
    const { bin } = this.props;
    return (
      <rect
        className="vx-heatmap-rect"
        width={bin.width}
        height={bin.height}
        x={bin.y}
        y={bin.x}
        fill={bin.color}
        fillOpacity={bin.opacity}
        onMouseEnter={() => console.log(bin)}
        onClick={event => {
          const { row, column } = bin;
          alert(JSON.stringify({ row, column, ...bin.bin }));
        }}
      />
    );
  }
}
