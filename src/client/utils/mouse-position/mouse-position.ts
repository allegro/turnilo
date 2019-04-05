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

interface MouseCoordinates {
  x: number;
  y: number;
}

type MouseCoordinatesCallback = (coordinates: MouseCoordinates) => void;

interface Subscription {
  unsubscribe(): void;
}

export class MousePosition {
  private callbacks: MouseCoordinatesCallback[] = [];
  private coordinates: MouseCoordinates = { x: 0, y: 0 };

  constructor(window: Window) {
    window.addEventListener("mousemove", e => {
      this.setCoordinates({
        x: e.clientX,
        y: e.clientY
      });
    });
  }

  getCoordinates(): MouseCoordinates {
    return this.coordinates;
  }

  onChange(callback: MouseCoordinatesCallback): Subscription {
    this.callbacks.push(callback);

    return {
      unsubscribe: () => {
        this.callbacks = this.callbacks.filter(filteredCallback => filteredCallback !== callback);
      }
    };
  }

  private setCoordinates(coordinates: MouseCoordinates) {
    this.coordinates = coordinates;
    this.callbacks.forEach(callback => callback(coordinates));
  }
}
