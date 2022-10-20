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

import { Dataset } from "plywood";
import React from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { FilterMode } from "../../../common/models/filter/filter";
import { Unary } from "../../../common/utils/functional/functional";
import { HighlightString } from "../highlight-string/highlight-string";
import "./preview-list.scss";
import { PreviewFilterMode } from "./preview-string-filter-menu";

interface PreviewListProps {
  dimension: Dimension;
  dataset: Dataset;
  searchText: string;
  regexErrorMessage: string;
  limit: number;
  filterMode: PreviewFilterMode;
}

const errorNotice = (content: string) => <div className="error-notice">{content}</div>;

interface RowProps {
  content: string;
  highlight: string;
}

const Row: React.FunctionComponent<RowProps> = ({ content, highlight }) => <div className="row no-select" title={content}>
  <div className="row-wrapper">
    <HighlightString className="label" text={content} highlight={highlight} />
  </div>
</div>;

function predicate(filterMode: PreviewFilterMode, searchText: string): Unary<unknown, boolean> {
  switch (filterMode) {
    case FilterMode.CONTAINS:
      return d => String(d).includes(searchText);
    case FilterMode.REGEX:
      const escaped = searchText.replace(/\\[^\\]]/g, "\\\\");
      const regexp = new RegExp(escaped);
      return d => regexp.test(String(d));
  }
}

function filterValues<T>(list: T[], filterMode: PreviewFilterMode, searchText: string): T[] {
  if (!searchText) return list;
  return list.filter(predicate(filterMode, searchText));
}

export const PreviewList: React.FunctionComponent<PreviewListProps> = props => {
  const { regexErrorMessage, searchText, dataset, filterMode, dimension, limit } = props;

  if (regexErrorMessage) return errorNotice(regexErrorMessage);

  const data = dataset.data;
  if (searchText && data.length === 0) return errorNotice(`No results for "${searchText}"`);

  const list = data.slice(0, limit).map(d => d[dimension.name]);
  const filtered = filterValues(list, filterMode, searchText);

  return <React.Fragment>
    {searchText && <div className="matching-values-message">Matching Values</div>}
    {filtered.map(value => <Row content={String(value)} highlight={searchText} key={String(value)} />)}
  </React.Fragment>;
};
