/*
 * Copyright 2015-2016 Imply Data, Inc.
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

export interface BarCoordinatesValue {
  x: number;
  y: number;
  height: number;
  width: number;

  barOffset: number;
  barWidth: number;
  stepWidth: number;
  children: BarCoordinates[];
}

export class BarCoordinates {
  public x: number;
  public y: number;
  public height: number;
  public width: number;

  public barOffset: number;
  public barWidth: number;
  public stepWidth: number;
  public children: BarCoordinates[];

  private hitboxMin: number;
  private hitboxMax: number;

  constructor(parameters: BarCoordinatesValue) {
    this.x = parameters.x;
    this.y = parameters.y;
    this.height = parameters.height;
    this.width = parameters.width;

    this.barOffset = parameters.barOffset;
    this.barWidth = parameters.barWidth;
    this.stepWidth = parameters.stepWidth;
    this.children = parameters.children;

    this.hitboxMin = this.x - this.barOffset;
    this.hitboxMax = this.x + this.barWidth + this.barOffset * 2;
  }

  isXWithin(x: number): boolean {
    return x >= this.hitboxMin && x <= this.hitboxMax;
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

  get middleX(): number {
    return this.x + this.barWidth * .5 + this.barOffset;
  }
}
