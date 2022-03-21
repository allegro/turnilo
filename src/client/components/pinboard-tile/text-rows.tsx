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

import { Datum } from "plywood";
import React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Unary } from "../../../common/utils/functional/functional";
import { TextRow } from "./text-row";

interface TextRowsProps {
  data: Datum[];
  dimension: Dimension;
  formatter: Unary<Datum, string>;
  searchText: string;
  onClick?: Unary<unknown, void>;
}

export const TextRows: React.FunctionComponent<TextRowsProps> = props => {
  const { data, dimension, onClick, formatter, searchText } = props;
  return <React.Fragment>
    {data.map(datum => {
      const value = datum[dimension.name];
      const measure = formatter(datum);
      return <TextRow
        key={String(value)}
        value={value}
        onClick={onClick}
        measure={measure}
        searchText={searchText}/>;
    })}
  </React.Fragment>;
};
