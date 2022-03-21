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
import { SortDirection } from "../../../../../common/models/sort/sort";
import { classNames } from "../../../../utils/dom/dom";
import { SortIcon } from "../../sort-icon/sort-icon";
import "./measure-header-cell.scss";

interface MeasureHeaderCellProps {
  width: number;
  title: string;
  sort: SortDirection | null;
  className?: string;
}

export const MeasureHeaderCell: React.FunctionComponent<MeasureHeaderCellProps> = ({ sort, width, title, className }) => {
  const sorted = sort !== null;
  return <div
    className={classNames("measure-header-cell", className, { sorted })}
    style={{ width }}>
    <div className="title-wrap">{title}</div>
    {sort && <SortIcon direction={sort} />}
  </div>;
};
