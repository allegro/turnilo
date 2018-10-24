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

const KiB = 1024;
const MiB = Math.pow(1024, 2);
const GiB = Math.pow(1024, 3);
const TiB = Math.pow(1024, 4);
const PiB = Math.pow(1024, 5);
const EiB = Math.pow(1024, 6);
const ZiB = Math.pow(1024, 7);
const YiB = Math.pow(1024, 8);

export const BYTE_PREFIXES = {
  KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB
};

export const METRIC_PREFIXES = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
