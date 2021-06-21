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

import { Dataset } from "plywood";
import * as React from "react";
import { Visualization } from "../../../common/models/visualization-manifest/visualization-manifest";
import { VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { classNames } from "../../utils/dom/dom";
import "./base-visualization.scss";

export interface BaseVisualizationState {
}

export class BaseVisualization<S extends BaseVisualizationState> extends React.Component<VisualizationProps, S> {
  protected className: Visualization = null;

  constructor(props: VisualizationProps) {
    super(props);

    this.state = this.getDefaultState() as S;
  }

  protected getDefaultState(): BaseVisualizationState {
    return {};
  }

  protected renderInternals(dataset: Dataset): JSX.Element {
    return null;
  }

  render() {
    // TODO: After removing BaseVisualization, renderInternals will become render and should not accept parameters
    const { data } = this.props;
    return <div className={classNames("base-visualization", this.className)}>
      {this.renderInternals(data)}
    </div>;
  }
}
