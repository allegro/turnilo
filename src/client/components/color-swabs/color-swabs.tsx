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
import { ColorEntry } from "./color-entry";
import "./color-swabs.scss";

interface ColorSwabsProps {
  colorEntries: ColorEntry[];
}

export const ColorSwabs: React.FunctionComponent<ColorSwabsProps> = ({ colorEntries }) => {
  const colorSwabs = colorEntries.map(({ color, name, value, previous, delta }: ColorEntry) => {
    const swabStyle = { background: color };
    return <tr key={name}>
      <td>
        <div className="color-swab" style={swabStyle} />
      </td>
      <td className="color-name">{name}</td>
      <td className="color-value">{value}</td>
      {previous && <td className="color-previous">{previous}</td>}
      {delta && <td className="color-delta">{delta}</td>}
    </tr>;
  });

  return <table className="color-swabs">
    <tbody>{colorSwabs}</tbody>
  </table>;
};
