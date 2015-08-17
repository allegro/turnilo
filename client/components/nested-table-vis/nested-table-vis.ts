'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import * as numeral from 'numeral';
import { $, Expression, Dispatcher, Dataset, Datum } from 'plywood';
import { listsEqual } from '../../utils/general';
import { formatterFromData } from '../../utils/formatter';
import { Filter, SplitCombine, Dimension, Measure, DataSource } from '../../models/index';
// import { SomeComp } from '../some-comp/some-comp';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 200;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;

const ROW_PADDING_RIGHT = 50;
const BODY_PADDING_BOTTOM = 90;

interface NestedTableVisProps {
  dataSource: DataSource;
  filter: Filter;
  splits: List<SplitCombine>;
  measures: List<Measure>;
  stage: ClientRect;
}

interface NestedTableVisState {
  dataset?: Dataset;
  scrollLeft?: number;
  scrollTop?: number;
}

export class NestedTableVis extends React.Component<NestedTableVisProps, NestedTableVisState> {
  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      dataset: null,
      scrollLeft: 0,
      scrollTop: 0
    };
  }

  fetchData(filter: Filter, splits: List<SplitCombine>, measures: List<Measure>) {
    var { dataSource } = this.props;
    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(filter.toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    splits.forEach((split) => {
      var subQuery = $main.split(split.splitOn, 'Split');

      measures.forEach((measure) => {
        subQuery = subQuery.apply(measure.name, measure.expression);
      });
      subQuery = subQuery.sort($(measures.first().name), 'descending').limit(100);

      query = query.apply('Split', subQuery);
    });

    dataSource.dispatcher(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({ dataset });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var props = this.props;
    this.fetchData(props.filter, props.splits, props.measures);
  }

  componentWillReceiveProps(nextProps: NestedTableVisProps) {
    var props = this.props;
    if (props.filter !== nextProps.filter || props.splits !== nextProps.splits || !listsEqual(props.measures, nextProps.measures)) {
      this.fetchData(nextProps.filter, nextProps.splits, nextProps.measures);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onScroll(e: UIEvent) {
    var target = <Element>e.target;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
  }

  render() {
    var { dataSource, measures, splits, stage } = this.props;
    var { dataset, scrollLeft, scrollTop } = this.state;

    var segmentTitle = splits.map((split) => dataSource.getDimension(split.dimension).title).join(', ');

    var measuresArray = measures.toArray();

    var headerColumns = measuresArray.map((measure, i) => {
      var sortArrow: React.ReactElement<any> = null;
      if (i === 0) {
        sortArrow = React.createElement(Icon, {
          name: 'sort-arrow',
          className: 'arrow',
          height: 16
        });
      }
      return JSX(`<div className="measure-name" key={measure.name}>{measure.title}{sortArrow}</div>`);
    });

    var segments: React.DOMElement<any>[] = [];
    var rows: React.DOMElement<any>[] = [];
    if (dataset) {
      var rowData = dataset.data[0]['Split'].data;

      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = rowData.map((d: Datum) => d[measureName]);
        return formatterFromData(measureValues, measure.format);
      });

      segments = rowData.map((d: Datum, rowIndex: number) => {
        return JSX(`<div className="segment" key={'_' + rowIndex}>{String(d['Split'])}</div>`);
      });

      rows = rowData.map((d: Datum, rowIndex: number) => {
        var row = measuresArray.map((measure, i) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[i](measureValue);
          return JSX(`<div className="measure" key={measure.name}>{measureValueStr}</div>`);
        });

        return JSX(`<div className="row" key={'_' + rowIndex}>{row}</div>`);
      });
    }

    var rowWidth = MEASURE_WIDTH * measuresArray.length + ROW_PADDING_RIGHT;

    // Extended so that the horizontal lines extend fully
    var rowWidthExtended = rowWidth;
    if (stage) {
      rowWidthExtended = Math.max(
        rowWidthExtended,
        stage.width - (SPACE_LEFT + SEGMENT_WIDTH + SPACE_RIGHT)
      );
    }

    const headerStyle = {
      width: rowWidthExtended,
      left: -scrollLeft
    };

    const segmentsStyle = {
      top: -scrollTop
    };

    const bodyStyle = {
      left: -scrollLeft,
      top: -scrollTop,
      width: rowWidthExtended
    };

    var horizontalScrollShadowStyle: any = { display: 'none' };
    if (scrollTop) {
      horizontalScrollShadowStyle = {
        width: SEGMENT_WIDTH + rowWidth - scrollLeft
      };
    }

    var verticalScrollShadowStyle: any = { display: 'none' };
    if (scrollLeft) {
      verticalScrollShadowStyle = {};
    }

    const scrollerStyle = {
      width: SPACE_LEFT + SEGMENT_WIDTH + rowWidth + SPACE_RIGHT,
      height: HEADER_HEIGHT + ROW_HEIGHT * rows.length + BODY_PADDING_BOTTOM
    };

    return JSX(`
      <div className="nested-table-vis">
        <div className="corner">{segmentTitle}</div>
        <div className="header-cont">
          <div className="header" style={headerStyle}>{headerColumns}</div>
        </div>
        <div className="segments-cont">
          <div className="segments" style={segmentsStyle}>{segments}</div>
        </div>
        <div className="body-cont">
          <div className="body" style={bodyStyle}>{rows}</div>
        </div>
        <div className="horizontal-scroll-shadow" style={horizontalScrollShadowStyle}></div>
        <div className="vertical-scroll-shadow" style={verticalScrollShadowStyle}></div>
        <div className="scroller-cont" onScroll={this.onScroll.bind(this)}>
          <div className="scroller" style={scrollerStyle}></div>
        </div>
      </div>
    `);
  }
}
