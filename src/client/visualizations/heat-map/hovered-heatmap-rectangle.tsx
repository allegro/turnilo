
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

type HoveredRectangleChangeCallback = (row: number, column: number) => void;

interface CallbackObject {
  start(): void;
  end(): void;
}

interface OnRectangleHoverCoordinates {
  row?: number;
  column?: number;
}

export class HoveredHeatmapRectangle {
  private callbacks: { [index: string]: CallbackObject } = {};
  private rowCallbacks: CallbackObject[] = [];
  private columnCallbacks: CallbackObject[] = [];
  private lastNotifiedRectangleIndex: [number, number] | null = null;

  onRectangleHover({ row, column }: OnRectangleHoverCoordinates, callbacks: CallbackObject) {
    if (row === undefined && column === undefined) {
      return;
    }

    if (column === undefined) {
      this.rowCallbacks[row] = callbacks;
      return;
    }

    if (row === undefined) {
      this.columnCallbacks[column] = callbacks;
      return;
    }

    this.callbacks[`${row}-${column}`] = callbacks;
  }

  setHoveredRectangle(row: number, column: number) {
    this.clearHoveredRectangle();

    this.callbacks[`${row}-${column}`].start();
    this.rowCallbacks[row] && this.rowCallbacks[row].start();
    this.columnCallbacks[column] && this.columnCallbacks[column].start();

    this.lastNotifiedRectangleIndex = [row, column];
  }

  clearHoveredRectangle() {
    if (this.lastNotifiedRectangleIndex) {
      this.callbacks[this.lastNotifiedRectangleIndex.join("-")].end();

      const [row, column] = this.lastNotifiedRectangleIndex;

      this.rowCallbacks[row] && this.rowCallbacks[row].end();
      this.columnCallbacks[column] && this.columnCallbacks[column].end();
    }
  }
}

interface Props {
  row?: number;
  column?: number;
  hoveredRectangle: HoveredHeatmapRectangle;
  component(isHovered?: boolean): React.ReactNode;
}
