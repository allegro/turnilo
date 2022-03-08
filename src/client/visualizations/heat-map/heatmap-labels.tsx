/*
 * Copyright 2015-2016 Imply Data, Inc.
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
import { noop } from "../../../common/utils/functional/functional";
import { classNames } from "../../utils/dom/dom";
import "./heatmap-labels.scss";

interface HeatmapLabelsProps {
  labels: string[];
  orientation: "top" | "left";
  hoveredLabel: number;
  highlightedLabel: number;
  labelSize?: number;

  onMaxLabelSize?(maxLabelSize: number): void;
}

const heatmapLabelClassName = "heatmap-label";

export class HeatmapLabels extends React.Component<HeatmapLabelsProps> {
  private container = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.container.current === null) {
      return;
    }

    const { onMaxLabelSize = noop } = this.props;

    const maxWidth = Array.from(this.container.current.querySelectorAll(`.${heatmapLabelClassName}`))
      .reduce((maxWidth, element: HTMLSpanElement) => Math.max(element.offsetWidth, maxWidth), 0);

    onMaxLabelSize(maxWidth + 10 /* consider elements padding */);
  }

  render() {
    const { labels, orientation, hoveredLabel, highlightedLabel, labelSize } = this.props;

    return (
      <div ref={this.container} className={`${orientation}-labels`}>
        {labels.map((label, index) => {
          const highlight = highlightedLabel === index;
          const hover = !highlight && hoveredLabel === index;
          return <span
            key={label}
            className={classNames("heatmap-label-wrapper", { "heatmap-label-hovered": hover, "heatmap-label-highlight": highlight })}>
            <span className={heatmapLabelClassName} style={labelSize ? { width: labelSize } : undefined}>
              <span className="heatmap-label-overflow-container">{label}</span>
            </span>
          </span>;
        })}
      </div>
    );
  }
}
