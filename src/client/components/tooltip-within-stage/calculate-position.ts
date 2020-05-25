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
import { TooltipWithinStageProps } from "./tooltip-within-stage";

export type Rect = ClientRect | DOMRect;

export type Position = Pick<React.CSSProperties, "left" | "top">;

export function calculatePosition(props: TooltipWithinStageProps, rect?: Rect): Position {
  const { top: initialTop, left: initialLeft, stage, margin = 10 } = props;
  if (!rect) {
    const top = initialTop + margin;
    const left = initialLeft + margin;
    return { top, left };
  }

  const stageBottom = stage.y + stage.height;
  const stageRight = stage.x + stage.width;

  const top = rect.bottom > stageBottom
    ? initialTop - margin - rect.height
    : rect.top < stage.y
      ? initialTop + rect.height
      : initialTop + margin;

  const left = rect.right > stageRight
    ? initialLeft - margin - rect.width
    : rect.left < stage.x
      ? initialLeft + rect.width
      : initialLeft + margin;

  return { top, left };
}
