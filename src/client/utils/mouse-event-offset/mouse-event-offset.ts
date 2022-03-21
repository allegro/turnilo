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

import React from "react";

function getBoundingClientOffset(element: HTMLElement | Window): { left: number, top: number } {
  if (element === window) {
    return { top: 0, left: 0 };
  }
  // typescript doesn't know that window is only value inhabiting Window type and can't narrow type here
  return (element as HTMLElement).getBoundingClientRect();
}

export function mouseEventOffset(event: React.MouseEvent<HTMLElement> | MouseEvent): [number, number] {
  const target = event.currentTarget as HTMLElement;
  const cx = event.clientX || 0;
  const cy = event.clientY || 0;
  const { left, top } = getBoundingClientOffset(target);
  return [cx - left, cy - top];
}
