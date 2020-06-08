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

import * as React from "react";
import { Stage } from "../../../common/models/stage/stage";
import { calculatePosition, Rect } from "./calculate-position";
import "./tooltip-within-stage.scss";

export interface TooltipWithinStageProps {
  stage: Stage;
  top: number;
  left: number;
  margin?: number;
}

interface TooltipWithinStageState {
  rect?: Rect;
}

export class TooltipWithinStage extends React.Component<TooltipWithinStageProps, TooltipWithinStageState> {

  private self = React.createRef<HTMLDivElement>();

  state: TooltipWithinStageState = {};

  componentDidMount() {
    this.setState({
      rect: this.self.current.getBoundingClientRect()
    });
  }

  render() {
    const { children } = this.props;
    return <div
      className="tooltip-within-stage"
      style={calculatePosition(this.props, this.state.rect)}
      ref={this.self}>
      {children}
    </div>;
  }
}
