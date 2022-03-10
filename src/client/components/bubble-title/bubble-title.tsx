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
import { clamp } from "../../utils/dom/dom";

const PER_LETTER_PIXELS = 8;
const MIN_TITLE_WIDTH = 80;
const MAX_TITLE_WIDTH = 300;

interface BubbleTitleProps {
  title: string;
}

export const BubbleTitle: React.FunctionComponent<BubbleTitleProps> = ({ title }) => {
  const minWidth = clamp(title.length * PER_LETTER_PIXELS, MIN_TITLE_WIDTH, MAX_TITLE_WIDTH);
  return <div className="title" style={{ minWidth }}>{title}</div>;
};
