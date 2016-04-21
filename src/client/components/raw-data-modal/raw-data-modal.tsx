require('./raw-data-modal.css');

import * as React from 'react';
import { List } from 'immutable';
import { $, Dataset, PlywoodValue, Datum, Set, AttributeInfo, isDate, PlyType } from 'plywood';
import { Essence, Stage, DataSource } from '../../../common/models/index';

import { Fn, makeTitle, arraySum } from "../../../common/utils/general/general";
import { download, makeFileName } from "../../utils/download/download";
import { formatLabel } from "../../../common/utils/formatter/formatter";
import { classNames } from "../../utils/dom/dom";
import { STRINGS, SEGMENT } from '../../config/constants';
import { Modal } from '../modal/modal';
import { Button } from '../button/button';
import { Scroller } from '../scroller/scroller';
import { Loader } from '../loader/loader';
import { QueryError } from '../query-error/query-error';
import { SimpleTable } from '../../components/simple-table/simple-table';

const SPACE_RIGHT = 10;
const SPACE_LEFT = 10;
const BODY_PADDING_BOTTOM = 90;
const ROW_HEIGHT = 30;
const LIMIT = 100;
const TIME_COL_WIDTH = 180;
const BOOLEAN_COL_WIDTH = 100;
const NUMBER_COL_WIDTH = 100;
const DEFAULT_COL_WIDTH = 200;

export interface RawDataModalProps extends React.Props<any> {
  onClose: Fn;
  stage: Stage;
  essence: Essence;
}

export interface RawDataModalState {
  dataset?: Dataset;
  error?: Error;
  loading?: boolean;
  scrollLeft?: number;
  scrollTop?: number;
}

function getColumnWidth(type: PlyType): number {
  switch (type) {
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
      error: null
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  fetchData(essence: Essence): void {
    const { dataSource } = essence;
    const $main = $('main');
    const query = $main.filter(essence.getEffectiveFilter().toExpression()).limit(LIMIT);
    this.setState({ loading: true });
    dataSource.executor(query)
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

  onScroll(e: UIEvent) {
    const target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
  }

  getStringifiedFilters(): List<string> {
    const { essence } = this.props;
    const { dataSource } = essence;
    return essence.getEffectiveFilter().clauses.map((clause, i) => {
      const dimension = dataSource.getDimensionByExpression(clause.expression);
      if (!dimension) return null;
      return formatLabel({ dimension, clause, essence, verbose: true });
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

  renderHeader(dataset: Dataset): JSX.Element[] {
    if (!dataset) return null;
    const { essence } = this.props;
    const { dataSource } = essence;
    const attributes = this.getSortedAttributes(dataSource);
    return attributes.map((attribute, i) => {
      const name = attribute.name;
      const width = getColumnWidth(attribute.type);
      const style = { width };
      const key = name;
      return (<div className={classNames("header-cell", classFromAttribute(attribute))} style={style} key={i}>
        <div className="title-wrap">
          {makeTitle(key)}
        </div>
      </div>);
    });
  }

  renderRows(dataset: Dataset, scrollTop: number, stage: Stage): JSX.Element[] {
    if (!dataset) return null;
    const { essence } = this.props;
    const { dataSource } = essence;

    const rawData = dataset.data;
    const firstElementToShow = SimpleTable.getFirstElementToShow(ROW_HEIGHT, scrollTop);
    const lastElementToShow = SimpleTable.getLastElementToShow(ROW_HEIGHT, rawData.length, scrollTop, stage.height);

    const rows = rawData.slice(firstElementToShow, lastElementToShow);
    const attributes = this.getSortedAttributes(dataSource);

    var rowY = firstElementToShow * ROW_HEIGHT;
    return rows.map((datum: Datum, i: number) => {
      var cols: JSX.Element[] = [];
      attributes.forEach((attribute: AttributeInfo) => {
        const name = attribute.name;
        const value: PlywoodValue = datum[name];
        const colStyle = {
          width: getColumnWidth(attribute.type)
        };

        var displayValue = value;

        if (isDate(datum[name])) {
          displayValue = (datum[name] as Date).toISOString();
        }

        cols.push(<div className={classNames('cell', classFromAttribute(attribute))} key={name} style={colStyle}>
          <span className="cell-value">{String(displayValue)}</span>
        </div>);

      });

      const rowStyle = { top: rowY };
      rowY += ROW_HEIGHT;
      return <div className="row" style={rowStyle} key={i}>{cols}</div>;
    });
  }

  render() {
    const { essence, onClose, stage } = this.props;
    const { dataset, loading, scrollTop, scrollLeft, error } = this.state;
    const { dataSource } = essence;

    const rowWidth = arraySum(dataSource.attributes.map((a) => getColumnWidth(a.type)));
    const title = `${makeTitle(SEGMENT.toLowerCase())} ${STRINGS.rawData}`;
    const dataLength = dataset ? dataset.data.length : 0;
    const bodyHeight = dataLength * ROW_HEIGHT;
    const scrollerStyle = {
      width: SPACE_LEFT + rowWidth + SPACE_RIGHT,
      height: bodyHeight + BODY_PADDING_BOTTOM
    };

    const filtersString = essence.getEffectiveFilter().getFileString(dataSource.timeAttribute);

    return <Modal
      className="raw-data-modal"
      title={title}
      onClose={onClose}
    >
      <div className="content">
        <ul className="filters">{this.renderFilters()}</ul>
        <div className="table-container">
          <SimpleTable
            scrollLeft={scrollLeft}
            scrollTop={scrollTop}
            rowHeight={ROW_HEIGHT}
            headerColumns={this.renderHeader(dataset)}
            rowWidth={rowWidth}
            rows={this.renderRows(dataset, scrollTop, stage)}
            dataLength={dataLength}
          />
          <Scroller style={scrollerStyle} onScroll={this.onScroll.bind(this)} />
        </div>
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

