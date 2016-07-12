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

require('./raw-data-modal.css');

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { List } from 'immutable';
import { $, Dataset, PlywoodValue, Datum, Set, AttributeInfo, isDate } from 'plywood';
import { Essence, Stage, DataSource } from '../../../common/models/index';

import { Fn, makeTitle, arraySum } from '../../../common/utils/general/general';
import { download, makeFileName } from '../../utils/download/download';
import { formatFilterClause } from '../../../common/utils/formatter/formatter';
import { classNames } from '../../utils/dom/dom';
import { getVisibleSegments } from '../../utils/sizing/sizing';
import { STRINGS } from '../../config/constants';
import { Modal } from '../modal/modal';
import { Button } from '../button/button';
import { Scroller, ScrollerLayout } from '../scroller/scroller';
import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';

const HEADER_HEIGHT = 30;
const ROW_HEIGHT = 30;
const LIMIT = 100;
const TIME_COL_WIDTH = 180;
const BOOLEAN_COL_WIDTH = 100;
const NUMBER_COL_WIDTH = 100;
const DEFAULT_COL_WIDTH = 200;

export interface RawDataModalProps extends React.Props<any> {
  onClose: Fn;
  essence: Essence;
}

export interface RawDataModalState {
  dataset?: Dataset;
  error?: Error;
  loading?: boolean;
  scrollLeft?: number;
  scrollTop?: number;
  stage?: Stage;
}

function getColumnWidth(attribute: AttributeInfo): number {
  switch (attribute.type) {
    case 'BOOLEAN':
      return BOOLEAN_COL_WIDTH;
    case 'NUMBER':
      return NUMBER_COL_WIDTH;
    case 'TIME':
      return TIME_COL_WIDTH;
    default:
      return DEFAULT_COL_WIDTH;
  }
}

function classFromAttribute(attribute: AttributeInfo): string {
  return classNames(
    String(attribute.type).toLowerCase().replace(/\//g, '-'),
    { unsplitable: attribute.unsplitable }
  );
}

export class RawDataModal extends React.Component<RawDataModalProps, RawDataModalState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      dataset: null,
      scrollLeft: 0,
      scrollTop: 0,
      error: null,
      stage: null
    };

    this.globalResizeListener = this.globalResizeListener.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const { essence } = this.props;
    this.fetchData(essence);
    this.globalResizeListener();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchData(essence: Essence): void {
    const { dataSource } = essence;
    const $main = $('main');
    const query = $main.filter(essence.getEffectiveFilter().toExpression()).limit(LIMIT);
    this.setState({ loading: true });
    dataSource.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
          if (!this.mounted) return;
          this.setState({
            dataset,
            loading: false
          });
        },
        (error: Error) => {
          if (!this.mounted) return;
          this.setState({
            error,
            loading: false
          });
        }
      );
  }

  globalResizeListener() {
    var { table } = this.refs;
    var tableDOM = ReactDOM.findDOMNode(table);
    if (!tableDOM) return;
    this.setState({
      stage: Stage.fromClientRect(tableDOM.getBoundingClientRect())
    });
  }

  onScroll(scrollTop: number, scrollLeft: number) {
    this.setState({scrollLeft, scrollTop});
  }

  getStringifiedFilters(): List<string> {
    const { essence } = this.props;
    const { dataSource } = essence;
    return essence.getEffectiveFilter().clauses.map((clause, i) => {
      const dimension = dataSource.getDimensionByExpression(clause.expression);
      if (!dimension) return null;
      var evaluatedClause = dimension.kind === 'time' ? essence.evaluateClause(clause) : clause;
      return formatFilterClause(dimension, evaluatedClause, essence.timezone);
    }).toList();
  }

  getSortedAttributes(dataSource: DataSource): AttributeInfo[] {
    const timeAttributeName = dataSource.timeAttribute ? dataSource.timeAttribute.name : null;

    var attributeRank = (attribute: AttributeInfo) => {
      const name = attribute.name;
      if (name === timeAttributeName) {
        return 1;
      } else if (attribute.unsplitable) {
        return 3;
      } else {
        return 2;
      }
    };

    return dataSource.attributes.sort((a1, a2) => {
      const score1 = attributeRank(a1);
      const score2 = attributeRank(a2);
      if (score1 === score2) {
        return a1.name.toLowerCase().localeCompare(a2.name.toLowerCase());
      }
      return score1 - score2;
    });

  }

  renderFilters(): List<JSX.Element> {
    const filters = this.getStringifiedFilters().map((filter: string, i: number) => {
      return <li className="filter" key={i}>{filter}</li>;
    }).toList();
    const limit = <li className="limit" key="limit">First {LIMIT} events matching </li>;
    return filters.unshift(limit);
  }

  renderHeader(): JSX.Element[] {
    const { essence } = this.props;
    const { dataset } = this.state;
    if (!dataset) return null;
    const { dataSource } = essence;

    const attributes = this.getSortedAttributes(dataSource);

    return attributes.map((attribute, i) => {
      const name = attribute.name;
      const width = getColumnWidth(attribute);
      const style = { width };
      const key = name;
      return (<div className={classNames("header-cell", classFromAttribute(attribute))} style={style} key={i}>
        <div className="title-wrap">
          {makeTitle(key)}
        </div>
      </div>);
    });
  }

  getVisibleIndices(rowCount: number, height: number): number[] {
    const { scrollTop } = this.state;

    return [
      Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
      Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
    ];
  }

  renderRows(): JSX.Element[] {
    const { essence } = this.props;
    const { dataset, scrollLeft, stage } = this.state;
    if (!dataset) return null;
    const { dataSource } = essence;

    const rawData = dataset.data;

    const [ firstRowToShow, lastRowToShow ] = this.getVisibleIndices(rawData.length, stage.height);

    const rows = rawData.slice(firstRowToShow, lastRowToShow);
    var attributes = this.getSortedAttributes(dataSource);
    var attributeWidths = attributes.map(getColumnWidth);

    const { startIndex, shownColumns } = getVisibleSegments(attributeWidths, scrollLeft, stage.width);
    var leftOffset = arraySum(attributeWidths.slice(0, startIndex));

    attributes = attributes.slice(startIndex, startIndex + shownColumns);

    var rowY = firstRowToShow * ROW_HEIGHT;
    return rows.map((datum: Datum, i: number) => {
      var cols: JSX.Element[] = [];
      attributes.forEach((attribute: AttributeInfo) => {
        const name = attribute.name;
        const value: PlywoodValue = datum[name];
        const colStyle = {
          width: getColumnWidth(attribute)
        };

        var displayValue = value;

        if (isDate(datum[name])) {
          displayValue = (datum[name] as Date).toISOString();
        }

        cols.push(<div className={classNames('cell', classFromAttribute(attribute))} key={name} style={colStyle}>
          <span className="cell-value">{String(displayValue)}</span>
        </div>);
      });

      const rowStyle = { top: rowY, left: leftOffset };
      rowY += ROW_HEIGHT;
      return <div className="row" style={rowStyle} key={i}>{cols}</div>;
    });
  }

  render() {
    const { essence, onClose } = this.props;
    const { dataset, loading, error } = this.state;
    const { dataSource } = essence;

    const title = `${makeTitle(STRINGS.segment)} ${STRINGS.rawData}`;

    const filtersString = essence.getEffectiveFilter().getFileString(dataSource.timeAttribute);

    const scrollerLayout: ScrollerLayout = {
      // Inner dimensions
      bodyWidth: arraySum(dataSource.attributes.map(getColumnWidth)),
      bodyHeight: (dataset ? dataset.data.length : 0) * ROW_HEIGHT,

      // Gutters
      top: HEADER_HEIGHT,
      right: 0,
      bottom: 0,
      left: 0
    };

    return <Modal
      className="raw-data-modal"
      title={title}
      onClose={onClose}
    >
      <div className="content">
        <ul className="filters">{this.renderFilters()}</ul>
        <Scroller
          ref="table"
          layout={scrollerLayout}
          topGutter={this.renderHeader()}
          body={this.renderRows()}
          onScroll={this.onScroll.bind(this)}
        />
        {error ? <QueryError error={error}/> : null}
        {loading ? <Loader/> : null}
        <div className="button-bar">
          <Button type="primary" className="close" onClick={onClose} title={STRINGS.close} />
          <Button
            type="secondary"
            className="download"
            onClick={download.bind(this, dataset, makeFileName(dataSource.name, filtersString, 'raw'), 'csv')}
            title={STRINGS.download}
            disabled={Boolean(loading || error)}
          />
        </div>
      </div>
    </Modal>;
  }
}

