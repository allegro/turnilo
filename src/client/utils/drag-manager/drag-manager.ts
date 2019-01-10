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

import { Dimension } from "../../../common/models/dimension/dimension";
import { Measure } from "../../../common/models/measure/measure";
import { SeriesDefinition } from "../../../common/models/series/series-definition";

export enum MeasureOrigin { SERIES_TILE = "series-tile", PANEL = "panel" }

export enum SeriesOrigin { SERIES_TILE = "series-tile" }

export enum DimensionOrigin { PANEL = "panel", FILTER_TILE = "filter-tile", SPLIT_TILE = "split-tile", PINBOARD = "pinboard"}

enum DraggedElementType { DIMENSION, MEASURE, SERIES }

interface DraggedElementBase<T> {
  type: DraggedElementType;
  element: T;
}

interface DraggedDimension extends DraggedElementBase<Dimension> {
  type: DraggedElementType.DIMENSION;
  origin: DimensionOrigin;
}

interface DraggedMeasure extends DraggedElementBase<Measure> {
  type: DraggedElementType.MEASURE;
  origin: MeasureOrigin;
}

interface DraggedSeries extends DraggedElementBase<SeriesDefinition> {
  type: DraggedElementType.SERIES;
  origin: SeriesOrigin;
}

type DraggedElement = DraggedDimension | DraggedMeasure | DraggedSeries;

function isDimension(el: DraggedElement): el is DraggedDimension {
  return el.type === DraggedElementType.DIMENSION;
}

function isMeasure(el: DraggedElement): el is DraggedMeasure {
  return el.type === DraggedElementType.MEASURE;
}

function isSeries(el: DraggedElement): el is DraggedSeries {
  return el.type === DraggedElementType.SERIES;
}

export class DragManager {
  static dragging: DraggedElement = null;

  static init() {
    document.addEventListener("dragend", () => {
      DragManager.dragging = null;
    }, false);
  }

  static isDraggingDimension(): boolean {
    return isDimension(DragManager.dragging);
  }

  static isDraggingMeasure(): boolean {
    return isMeasure(DragManager.dragging);
  }

  static isDraggingSeries(): boolean {
    return isSeries(DragManager.dragging);
  }

  static setDragDimension(element: Dimension, origin: DimensionOrigin) {
    this.dragging = { type: DraggedElementType.DIMENSION, origin, element };
  }

  static setDragMeasure(element: Measure, origin: MeasureOrigin) {
    this.dragging = { type: DraggedElementType.MEASURE, origin, element };
  }

  static setDragSeries(element: SeriesDefinition, origin: SeriesOrigin) {
    this.dragging = { type: DraggedElementType.SERIES, origin, element };
  }

  static draggingDimension(): Dimension {
    const el = DragManager.dragging;
    return isDimension(el) ? el.element : null;
  }

  static draggingMeasure(): Measure {
    const el = DragManager.dragging;
    return isMeasure(el) ? el.element : null;
  }

  static draggingSeries(): SeriesDefinition {
    const el = DragManager.dragging;
    return isSeries(el) ? el.element : null;
  }
}
