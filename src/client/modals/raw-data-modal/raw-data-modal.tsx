/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { isDate } from "chronoshift";
import { List } from "immutable";
import { AttributeInfo, Dataset, Datum, Expression } from "plywood";
import React from "react";
import { ClientDataCube } from "../../../common/models/data-cube/data-cube";
import { findDimensionByName } from "../../../common/models/dimension/dimensions";
import { Essence } from "../../../common/models/essence/essence";
import { Locale } from "../../../common/models/locale/locale";
import { LIMIT } from "../../../common/models/raw-data-modal/raw-data-modal";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { formatFilterClause } from "../../../common/utils/formatter/formatter";
import { arraySum, Fn, makeTitle } from "../../../common/utils/general/general";
import { Button } from "../../components/button/button";
import { Loader } from "../../components/loader/loader";
import { Modal } from "../../components/modal/modal";
import { QueryError } from "../../components/query-error/query-error";
import { Scroller, ScrollerLayout } from "../../components/scroller/scroller";
import { exportOptions, STRINGS } from "../../config/constants";
import { classNames } from "../../utils/dom/dom";
import { download, FileFormat, fileNameBase } from "../../utils/download/download";
import { getVisibleSegments } from "../../utils/sizing/sizing";
import { ApiContext, ApiContextValue } from "../../views/cube-view/api-context";
import "./raw-data-modal.scss";

const HEADER_HEIGHT = 30;
const ROW_HEIGHT = 30;
const TIME_COL_WIDTH = 180;
const BOOLEAN_COL_WIDTH = 100;
const NUMBER_COL_WIDTH = 100;
const DEFAULT_COL_WIDTH = 200;

export interface RawDataModalProps {
  onClose: Fn;
  essence: Essence;
  timekeeper: Timekeeper;
  locale: Locale;
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
    case "BOOLEAN":
      return BOOLEAN_COL_WIDTH;
    case "NUMBER":
      return NUMBER_COL_WIDTH;
    case "TIME":
      return TIME_COL_WIDTH;
    default:
      return DEFAULT_COL_WIDTH;
  }
}

function classFromAttribute(attribute: AttributeInfo): string {
  return classNames(
    String(attribute.type).toLowerCase().replace(/\//g, "-"),
    { unsplitable: attribute.unsplitable }
  );
}

export class RawDataModal extends React.Component<RawDataModalProps, RawDataModalState> {
  static contextType = ApiContext;

  public mounted: boolean;
  context: ApiContextValue;

  constructor(props: RawDataModalProps) {
    super(props);
    this.state = {
      loading: false,
      dataset: null,
      scrollLeft: 0,
      scrollTop: 0,
      error: null,
      stage: null
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
    const { rawDataQuery } = this.context;
    this.setState({ loading: true });
    rawDataQuery(essence)
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

  onScrollerViewportUpdate = (viewPortStage: Stage) => {
    if (!viewPortStage.equals(this.state.stage)) {
      this.setState({
        stage: viewPortStage
      });
    }
  };

  onScroll = (scrollTop: number, scrollLeft: number) => {
    this.setState({ scrollLeft, scrollTop });
  };

  getStringifiedFilters(): List<string> {
    const { essence, timekeeper } = this.props;
    const { dataCube } = essence;

    return essence.getEffectiveFilter(timekeeper).clauses.map(clause => {
      const dimension = findDimensionByName(dataCube.dimensions, clause.reference);
      if (!dimension) return null;
      return formatFilterClause(dimension, clause, essence.timezone);
    }).toList();
  }

  getSortedAttributes(dataCube: ClientDataCube): AttributeInfo[] {
    const attributeRank = (attribute: AttributeInfo) => {
      const name = attribute.name;
      if (name === dataCube.timeAttribute) {
        return 1;
      } else if (attribute.unsplitable) {
        return 3;
      } else {
        return 2;
      }
    };

    return dataCube.attributes.sort((a1, a2) => {
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
    const { dataCube } = essence;

    const attributes = this.getSortedAttributes(dataCube);

    return attributes.map((attribute, i) => {
      const name = attribute.name;
      const width = getColumnWidth(attribute);
      const style = { width };
      return (<div className={classNames("header-cell", classFromAttribute(attribute))} style={style} key={i}>
        <div className="title-wrap">
          {makeTitle(name)}
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
    const { dataCube } = essence;

    const rawData = dataset.data;

    const [firstRowToShow, lastRowToShow] = this.getVisibleIndices(rawData.length, stage.height);

    const rows = rawData.slice(firstRowToShow, lastRowToShow);
    let attributes = this.getSortedAttributes(dataCube);
    const attributeWidths = attributes.map(getColumnWidth);

    const { startIndex, shownColumns } = getVisibleSegments(attributeWidths, scrollLeft, stage.width);
    const leftOffset = arraySum(attributeWidths.slice(0, startIndex));

    attributes = attributes.slice(startIndex, startIndex + shownColumns);

    let rowY = firstRowToShow * ROW_HEIGHT;
    return rows.map((datum: Datum, i: number) => {
      const cols: JSX.Element[] = [];
      attributes.forEach((attribute: AttributeInfo) => {
        const name = attribute.name;
        const datumAttribute = datum[name];
        const value = (datumAttribute instanceof Expression) ? datumAttribute.resolve(datum).simplify() : datum[name];
        const colStyle = {
          width: getColumnWidth(attribute)
        };

        let displayValue = value;

        if (isDate(datum[name])) {
          displayValue = (datum[name] as Date).toISOString();
        }

        cols.push(<div className={classNames("cell", classFromAttribute(attribute))} key={name} style={colStyle}>
          <span className="cell-value">{String(displayValue)}</span>
        </div>);
      });

      const rowStyle = { top: rowY, left: leftOffset };
      rowY += ROW_HEIGHT;
      return <div className="row" style={rowStyle} key={i}>{cols}</div>;
    });
  }

  renderButtons(): JSX.Element {
    const { loading, error } = this.state;
    const { onClose } = this.props;

    const buttons: JSX.Element[] = [];

    buttons.push(<Button type="primary" key="close" className="close" onClick={onClose} title={STRINGS.close} />);

    exportOptions.forEach(({ label, fileFormat }) => {
      buttons.push(
        <Button
          type="secondary"
          className="download"
          key={`download-${fileFormat}`}
          onClick={() => this.download(fileFormat)}
          title={label}
          disabled={Boolean(loading || error)}
        />
      );
    });

    return <div className="button-bar">
      {buttons}
    </div>;
  }

  download(fileFormat: FileFormat) {
    const { dataset } = this.state;
    const { essence, locale, timekeeper } = this.props;

    const fileName = fileNameBase(essence, timekeeper);
    download(dataset, essence, fileFormat, `${fileName}_raw_data`, locale.exportEncoding);
  }

  render() {
    const { essence, onClose } = this.props;
    const { dataset, loading, error, stage } = this.state;
    const { dataCube } = essence;

    const title = `${makeTitle(STRINGS.rawData)}`;

    const scrollerLayout: ScrollerLayout = {
      // Inner dimensions
      bodyWidth: arraySum(dataCube.attributes.map(getColumnWidth)),
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
          body={stage && this.renderRows()}
          onScroll={this.onScroll}
          onViewportUpdate={this.onScrollerViewportUpdate}
        />
        {error ? <QueryError error={error} /> : null}
        {loading ? <Loader /> : null}
        {this.renderButtons()}
      </div>
    </Modal>;
  }
}
