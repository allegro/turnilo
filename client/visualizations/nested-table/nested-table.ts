'use strict';

import { List } from 'immutable';
import * as React from 'react/addons';
import * as Icon from 'react-svg-icons';
import * as numeral from 'numeral';
import { $, Expression, Executor, Dataset, Datum, TimeRange } from 'plywood';
import { listsEqual } from '../../utils/general';
import { formatterFromData } from '../../utils/formatter';
import { Stage, Filter, Essence, Splits, SplitCombine, Dimension, Measure, DataSource, Clicker, VisualizationProps, Resolve } from '../../models/index';
import { Loader } from '../../components/loader/loader';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;

const ROW_PADDING_RIGHT = 50;
const BODY_PADDING_BOTTOM = 90;

function formatSegment(value: any): string {
  if (TimeRange.isTimeRange(value)) {
    return value.start.toISOString();
  }
  return String(value);
}

interface NestedTableState {
  loading?: boolean;
  flatData?: Datum[];
  scrollLeft?: number;
  scrollTop?: number;
}

export class NestedTable extends React.Component<VisualizationProps, NestedTableState> {
  static id = 'nested-table';
  static title = 'Nested Table';
  static handleCircumstance(dataSource: DataSource, splits: Splits): Resolve {
    return splits.length() ? Resolve.READY : Resolve.MANUAL;
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      loading: false,
      flatData: null,
      scrollLeft: 0,
      scrollTop: 0
    };
  }

  fetchData(essence: Essence): void {
    var { splits, dataSource } = essence;
    var measures = essence.getMeasures();

    var $main = $('main');

    var query: any = $()
      .apply('main', $main.filter(essence.getEffectiveFilter(NestedTable.id).toExpression()));

    measures.forEach((measure) => {
      query = query.apply(measure.name, measure.expression);
    });

    var limit = splits.length() > 1 ? 10 : 50;
    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var subQuery = $main.split(split.toSplitExpression(), 'Segment');

      measures.forEach((measure) => {
        subQuery = subQuery.apply(measure.name, measure.expression);
      });
      subQuery = subQuery.sort($(measures.first().name), 'descending').limit(limit);

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply('Split', makeQuery(i + 1));
      }

      return subQuery;
    }

    query = query.apply('Split', makeQuery(0));

    this.setState({ loading: true });
    dataSource.executor(query).then((dataset) => {
      if (!this.mounted) return;
      this.setState({
        loading: false,
        flatData: dataset.flatten({
          order: 'preorder',
          nestingName: '__nest'
        })
      });
    });
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      essence.differentEffectiveFilter(nextEssence, NestedTable.id) ||
      essence.differentSplits(nextEssence) ||
      essence.differentSelectedMeasures(nextEssence)
    ) {
      this.fetchData(nextEssence);
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
    var { essence, stage } = this.props;
    var { flatData, scrollLeft, scrollTop, loading } = this.state;

    var segmentTitle = essence.splits.getTitle(essence.dataSource);

    var measuresArray = essence.getMeasures().toArray();

    var headerColumns = measuresArray.map((measure, i) => {
      var sortArrow: React.ReactElement<any> = null;
      if (i === 0) {
        sortArrow = React.createElement(Icon, {
          name: 'sort-arrow',
          className: 'arrow',
          width: 8
        });
      }
      return JSX(`<div className="measure-name" key={measure.name}>{measure.title}{sortArrow}</div>`);
    });

    var segments: React.DOMElement<any>[] = [];
    var rows: React.DOMElement<any>[] = [];
    if (flatData) {
      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = flatData.map((d: Datum) => d[measureName]);
        return formatterFromData(measureValues, measure.format);
      });

      const skipNumber = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT));
      const lastElementToShow = Math.min(flatData.length, Math.ceil((scrollTop + stage.height) / ROW_HEIGHT));

      var rowY = skipNumber * ROW_HEIGHT;
      for (var i = skipNumber; i < lastElementToShow; i++) {
        var d = flatData[i];
        var nest = d['__nest'];
        var segmentName = nest ? formatSegment(d['Segment']) : 'Total';
        var left = Math.max(0, nest - 1) * INDENT_WIDTH;
        var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
        segments.push(JSX(`
          <div
            className={'segment nest' + nest}
            key={'_' + i}
            style={segmentStyle}
          >{segmentName}</div>
        `));

        var row = measuresArray.map((measure, j) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[j](measureValue);
          return JSX(`<div className="measure" key={measure.name}>{measureValueStr}</div>`);
        });

        var rowStyle = { top: rowY };
        rows.push(JSX(`<div className="row" key={'_' + i} style={rowStyle}>{row}</div>`));

        rowY += ROW_HEIGHT;
      }
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

    const bodyHeight = flatData ? flatData.length * ROW_HEIGHT : 0;
    const bodyStyle = {
      left: -scrollLeft,
      top: -scrollTop,
      width: rowWidthExtended,
      height: bodyHeight
    };

    var horizontalScrollShadowStyle: any = { display: 'none' };
    if (scrollTop) {
      horizontalScrollShadowStyle = {
        width: SEGMENT_WIDTH + rowWidthExtended - scrollLeft
      };
    }

    var verticalScrollShadowStyle: any = { display: 'none' };
    if (scrollLeft) {
      verticalScrollShadowStyle = {};
    }

    const scrollerStyle = {
      width: SPACE_LEFT + SEGMENT_WIDTH + rowWidth + SPACE_RIGHT,
      height: HEADER_HEIGHT + bodyHeight + BODY_PADDING_BOTTOM
    };

    var loader: React.ReactElement<any> = null;
    if (loading) {
      loader = React.createElement(Loader, null);
    }

    return JSX(`
      <div className="nested-table">
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
        {loader}
        <div className="scroller-cont" onScroll={this.onScroll.bind(this)}>
          <div className="scroller" style={scrollerStyle}></div>
        </div>
      </div>
    `);
  }
}
