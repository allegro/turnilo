/*
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
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { FancyDragIndicator } from "./fancy-drag-indicator";

interface DragIndicatorProps {
  drop: Unary<React.DragEvent<HTMLElement>, void>;
  dragLeave: Fn;
  dragOver: Unary<React.DragEvent<HTMLElement>, void>;
  dragPosition?: DragPosition;
}

export const DragIndicator: React.FunctionComponent<DragIndicatorProps> = props => {
  const { dragPosition, dragOver, drop, dragLeave } = props;
  if (!dragPosition) return null;
  return <React.Fragment>
    <FancyDragIndicator dragPosition={dragPosition} />
    <div className="drag-mask"
         onDragOver={dragOver}
         onDragLeave={dragLeave}
         onDragExit={dragLeave}
         onDrop={drop} />
  </React.Fragment>;
};
