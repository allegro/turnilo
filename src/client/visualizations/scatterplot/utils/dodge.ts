/*
 * Copyright 2017-2022 Allegro.pl
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
import * as d3 from "d3";

// Given an array of x-values and a separation radius, returns an array of y-values.
export function dodge(X: number[], radius: number) {
  const Y = new Float64Array(X.length);
  const radius2 = radius ** 2;
  const epsilon = 1e-3;
  // @ts-ignore
  let head = null;
  // @ts-ignore
  let tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x: number, y: number) {
    // @ts-ignore
    let a = head;
    while (a) {
      const ai = a.index;
      if (radius2 - epsilon > (X[ai] - x) ** 2 + (Y[ai] - y) ** 2) return true;
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const bi of d3.range(X.length).sort((i, j) => X[i] - X[j])) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && X[head.index] < X[bi] - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(X[bi], Y[bi] = 0)) {
      let a = head;
      Y[bi] = Infinity;
      do {
        const ai = a.index;
        let y1 = Y[ai] + Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
        let y2 = Y[ai] - Math.sqrt(radius2 - (X[ai] - X[bi]) ** 2);
        if (Math.abs(y1) < Math.abs(Y[bi]) && !intersects(X[bi], y1)) Y[bi] = y1;
        if (Math.abs(y2) < Math.abs(Y[bi]) && !intersects(X[bi], y2)) Y[bi] = y2;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    // @ts-ignore
    const b = { index: bi, next: null };
    if (head === null) head = tail = b;
    // @ts-ignore
    else tail = tail.next = b;
  }

  return Y;
}
