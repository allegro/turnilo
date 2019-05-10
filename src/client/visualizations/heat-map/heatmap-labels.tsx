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

interface HeatmapLabelsProps {
  labels: string[];
  orientation: "top" | "left";
  hoveredLabel: number;
  labelSize?: number;
  onMaxLabelSize?(maxLabelSize: number): void;
}

export class HeatmapLabels extends React.Component<HeatmapLabelsProps> {
  private container: HTMLDivElement | null = null;

  componentDidMount() {
    if (this.container === null) {
      return;
    }

    const {
      onMaxLabelSize = () => {}
    } = this.props;

    const maxWidth = Array.from(this.container.querySelectorAll(".heatmap-label"))
      .reduce((maxWidth, element: HTMLSpanElement) => Math.max(element.offsetWidth, maxWidth), 0);

    onMaxLabelSize(maxWidth + 10 /* consider elements padding */);
  }

  render() {
    const { labels, orientation, hoveredLabel, labelSize } = this.props;

    return (
      <div ref={container => this.container = container} className={`${orientation}-labels`}>
        {labels.map((label, index) => <span key={label} className={`heatmap-label-wrapper ${hoveredLabel === index ? "heatmap-label-hovered" : ""}`}>
          <span className="heatmap-label" style={labelSize ? { width: labelSize } : undefined}>{label}</span>
        </span>)}
      </div>
    );
  }
}
