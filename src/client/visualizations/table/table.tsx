require('./table.css');

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { $, ply, r, Expression, RefExpression, Executor, Dataset, Datum, PseudoDatum, TimeRange, Set, SortAction } from 'plywood';
import { formatterFromData } from '../../../common/utils/formatter/formatter';
import { Stage, Filter, FilterClause, Essence, VisStrategy, Splits, SplitCombine, Dimension,
  Measure, Colors, DataSource, VisualizationProps, DatasetLoad, Resolve } from '../../../common/models/index';
import { SPLIT, SEGMENT, TIME_SEGMENT } from '../../config/constants';
import { getXFromEvent, getYFromEvent } from '../../utils/dom/dom';
import { SvgIcon } from '../../components/svg-icon/svg-icon';
import { SegmentBubble } from '../../components/segment-bubble/segment-bubble';
import { Scroller } from '../../components/scroller/scroller';
import { SimpleTable, InlineStyle } from '../../components/simple-table/simple-table';
import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';

const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 100;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;
const ROW_PADDING_RIGHT = 50;
const BODY_PADDING_BOTTOM = 90;
const HIGHLIGHT_BUBBLE_V_OFFSET = -4;

function formatSegment(value: any): string {
  if (TimeRange.isTimeRange(value)) {
    return value.start.toISOString();
  }
  return String(value);
}

function getFilterFromDatum(splits: Splits, flatDatum: PseudoDatum): Filter {
  if (flatDatum['__nest'] === 0) return null;
  var segments: any[] = [];
  while (flatDatum['__nest'] > 0) {
    segments.unshift(flatDatum[SEGMENT]);
    flatDatum = flatDatum['__parent'];
  }
  return new Filter(List(segments.map((segment, i) => {
    return new FilterClause({
      expression: splits.get(i).expression,
      selection: r(TimeRange.isTimeRange(segment) ? segment : Set.fromJS([segment]))
    });
  })));
}

export interface PositionHover {
  what: string;
  measure?: Measure;
  row?: Datum;
}

export interface TableState {
  datasetLoad?: DatasetLoad;
  flatData?: PseudoDatum[];
  scrollLeft?: number;
  scrollTop?: number;
  hoverMeasure?: Measure;
  hoverRow?: Datum;
}

export class Table extends React.Component<VisualizationProps, TableState> {
  static id = 'table';
  static title = 'Table';

  static measureModeNeed = 'multi';

  static handleCircumstance(dataSource: DataSource, splits: Splits, colors: Colors, current: boolean): Resolve {
    // Must have at least one dimension
    if (splits.length() === 0) {
      var someDimensions = dataSource.dimensions.toArray().filter(d => d.kind === 'string').slice(0, 2);
      return Resolve.manual(4, 'This visualization requires at least one split',
        someDimensions.map((someDimension) => {
          return {
            description: `Add a split on ${someDimension.title}`,
            adjustment: {
              splits: Splits.fromSplitCombine(SplitCombine.fromExpression(someDimension.expression))
            }
          };
        })
      );
    }

    // Auto adjustment
    var autoChanged = false;
    splits = splits.map((split, i) => {
      var splitDimension = dataSource.getDimensionByExpression(split.expression);

      if (!split.sortAction) {
        split = split.changeSortAction(dataSource.getDefaultSortAction());
        autoChanged = true;
      } else if (split.sortAction.refName() === TIME_SEGMENT) {
        split = split.changeSortAction(new SortAction({
          expression: $(SEGMENT),
          direction: split.sortAction.direction
        }));
        autoChanged = true;
      }

      // ToDo: review this
      if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
        split = split.changeLimit(i ? 5 : 50);
        autoChanged = true;
      }

      return split;
    });

    if (colors) {
      colors = null;
      autoChanged = true;
    }

    return autoChanged ? Resolve.automatic(6, { splits }) : Resolve.ready(current ? 10 : 8);
  }

  public mounted: boolean;

  constructor() {
    super();
    this.state = {
      datasetLoad: {},
      flatData: null,
      scrollLeft: 0,
      scrollTop: 0,
      hoverMeasure: null,
      hoverRow: null
    };
  }

  fetchData(essence: Essence): void {
    var { registerDownloadableDataset } = this.props;
    var { splits, dataSource } = essence;
    var measures = essence.getEffectiveMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(Table.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeQuery(i: number): Expression {
      var split = splits.get(i);
      var { sortAction, limitAction } = split;
      if (!sortAction) throw new Error('something went wrong in table query generation');

      var subQuery = $main.split(split.toSplitExpression(), SEGMENT);

      measures.forEach((measure) => {
        subQuery = subQuery.performAction(measure.toApplyAction());
      });

      var applyForSort = essence.getApplyForSort(sortAction);
      if (applyForSort) {
        subQuery = subQuery.performAction(applyForSort);
      }
      subQuery = subQuery.performAction(sortAction);

      if (limitAction) {
        subQuery = subQuery.performAction(limitAction);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, makeQuery(i + 1));
      }

      return subQuery;
    }

    query = query.apply(SPLIT, makeQuery(0));

    this.precalculate(this.props, { loading: true });
    dataSource.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
          if (!this.mounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          if (!this.mounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this.mounted = true;
    var { essence } = this.props;
    this.fetchData(essence);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.precalculate(nextProps);
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, Table.id) ||
      nextEssence.differentEffectiveSplits(essence) ||
      nextEssence.newEffectiveMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  onScroll(e: UIEvent) {
    var target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    });
  }

  calculateMousePosition(e: MouseEvent): PositionHover {
    var { essence } = this.props;
    var { flatData, scrollLeft, scrollTop } = this.state;
    var rect = ReactDOM.findDOMNode(this.refs['base']).getBoundingClientRect();
    var x = getXFromEvent(e) - rect.left;
    var y = getYFromEvent(e) - rect.top;

    if (x <= SPACE_LEFT) return { what: 'space-left' };
    x -= SPACE_LEFT;

    if (y <= HEADER_HEIGHT) {
      if (x <= SEGMENT_WIDTH) return { what: 'corner' };

      x = x - SEGMENT_WIDTH + scrollLeft;
      var measureIndex = Math.floor(x / MEASURE_WIDTH);
      var measure = essence.getEffectiveMeasures().get(measureIndex);
      if (!measure) return { what: 'whitespace' };
      return { what: 'header', measure };
    }

    y = y - HEADER_HEIGHT + scrollTop;
    var rowIndex = Math.floor(y / ROW_HEIGHT);
    var datum = flatData ? flatData[rowIndex] : null;
    if (!datum) return { what: 'whitespace' };
    return { what: 'row', row: datum };
  }

  onMouseLeave() {
    var { hoverMeasure, hoverRow } = this.state;
    if (hoverMeasure || hoverRow) {
      this.setState({
        hoverMeasure: null,
        hoverRow: null
      });
    }
  }

  onMouseMove(e: MouseEvent) {
    var { hoverMeasure, hoverRow } = this.state;
    var pos = this.calculateMousePosition(e);
    if (hoverMeasure !== pos.measure || hoverRow !== pos.row) {
      this.setState({
        hoverMeasure: pos.measure,
        hoverRow: pos.row
      });
    }
  }

  onClick(e: MouseEvent) {
    var { clicker, essence } = this.props;
    var pos = this.calculateMousePosition(e);

    if (pos.what === 'corner' || pos.what === 'header') {
      var sortExpression = $(pos.what === 'corner' ? SEGMENT : pos.measure.name);
      var commonSort = essence.getCommonSort();
      var myDescending = (commonSort && commonSort.expression.equals(sortExpression) && commonSort.direction === SortAction.DESCENDING);
      clicker.changeSplits(essence.splits.changeSortAction(new SortAction({
        expression: sortExpression,
        direction: myDescending ? SortAction.ASCENDING : SortAction.DESCENDING
      })), VisStrategy.KeepAlways);

    } else if (pos.what === 'row') {
      var rowHighlight = getFilterFromDatum(essence.splits, pos.row);
      if (!rowHighlight) return;

      if (essence.highlightOn(Table.id)) {
        if (rowHighlight.equals(essence.highlight.delta)) {
          clicker.dropHighlight();
          return;
        }
      }

      clicker.changeHighlight(Table.id, null, rowHighlight);
    }
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

    var existingDatasetLoad = this.state.datasetLoad;
    var newState: TableState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading (for now)
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = this.state.datasetLoad;
    }

    var { dataset } = datasetLoad;

    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);

      newState.flatData = dataset.flatten({
        order: 'preorder',
        nestingName: '__nest',
        parentName: '__parent'
      });
    }

    this.setState(newState);
  }

  render() {
    var { clicker, essence, stage, openRawDataModal } = this.props;
    var { datasetLoad, flatData, scrollLeft, scrollTop, hoverMeasure, hoverRow } = this.state;
    var { splits } = essence;

    var segmentTitle = splits.getTitle(essence.dataSource.dimensions);
    var commonSort = essence.getCommonSort();
    var commonSortName = commonSort ? (commonSort.expression as RefExpression).name : null;

    var sortArrowIcon = commonSort ? React.createElement(SvgIcon, {
      svg: require('../../icons/sort-arrow.svg'),
      className: 'sort-arrow ' + commonSort.direction
    }) : null;

    var cornerSortArrow: JSX.Element = null;
    if (commonSortName === SEGMENT) {
      cornerSortArrow = sortArrowIcon;
    }

    var measuresArray = essence.getEffectiveMeasures().toArray();

    var headerColumns = measuresArray.map((measure, i) => {
      return <div
        className={'measure-name' + (measure === hoverMeasure ? ' hover' : '')}
        key={measure.name}
      >
        <div className="title-wrap">{measure.title}</div>
        {commonSortName === measure.name ? sortArrowIcon : null}
      </div>;
    });

    var segments: JSX.Element[] = [];
    var rows: JSX.Element[] = [];
    var highlighter: JSX.Element = null;
    var highlighterStyle: any = null;
    var highlightBubble: JSX.Element = null;
    if (flatData) {
      var formatters = measuresArray.map(measure => {
        var measureName = measure.name;
        var measureValues = flatData.map((d: Datum) => d[measureName] as number);
        return formatterFromData(measureValues, measure.format);
      });

      var highlightDelta: Filter = null;
      if (essence.highlightOn(Table.id)) {
        highlightDelta = essence.highlight.delta;
      }

      const skipNumber = SimpleTable.getFirstElementToShow(ROW_HEIGHT, scrollTop);
      const lastElementToShow = SimpleTable.getLastElementToShow(ROW_HEIGHT, flatData.length, scrollTop, stage.height);

      var rowY = skipNumber * ROW_HEIGHT;
      for (var i = skipNumber; i < lastElementToShow; i++) {
        var d = flatData[i];
        var nest = d['__nest'];
        var segmentValue = d[SEGMENT];
        var segmentName = nest ? formatSegment(segmentValue) : 'Total';
        var left = Math.max(0, nest - 1) * INDENT_WIDTH;
        var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
        var hoverClass = d === hoverRow ? ' hover' : '';

        var selected = false;
        var selectedClass = '';
        if (highlightDelta) {
          selected = highlightDelta.equals(getFilterFromDatum(splits, d));
          selectedClass = selected ? 'selected' : 'not-selected';
        }

        segments.push(<div
          className={'segment nest' + nest + ' ' + selectedClass + hoverClass}
          key={'_' + i}
          style={segmentStyle}
        >{segmentName}</div>);

        var row = measuresArray.map((measure, j) => {
          var measureValue = d[measure.name];
          var measureValueStr = formatters[j](measureValue);
          return <div className="measure" key={measure.name}>{measureValueStr}</div>;
        });

        var rowStyle = SimpleTable.getRowStyle(rowY);
        rows.push(<div
          className={'row nest' + nest + ' ' + selectedClass + hoverClass}
          key={'_' + i}
          style={rowStyle}
        >{row}</div>);

        if (!highlighter && selected) {
          highlighterStyle = {
            top: rowY,
            left
          };

          var dimension = essence.dataSource.getDimensionByExpression(splits.splitCombines.get(nest - 1).expression);

          highlighter = <div className='highlighter' key='highlight' style={highlighterStyle}></div>;

          highlightBubble = <SegmentBubble
            left={stage.x + stage.width / 2}
            top={stage.y + HEADER_HEIGHT + rowY - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET}
            hideText={true}
            segmentLabel={segmentName}
            dimension={dimension}
            clicker={clicker}
            openRawDataModal={openRawDataModal}
          />;
        }

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

    const segmentsStyle = {
      top: -scrollTop
    };

    const bodyHeight = flatData ? flatData.length * ROW_HEIGHT : 0;

    const highlightStyle = {
      top: -scrollTop
    };

    var verticalScrollShadowStyle: any = { display: 'none' };
    if (scrollLeft) {
      verticalScrollShadowStyle = {};
    }

    const scrollerStyle = {
      width: SPACE_LEFT + SEGMENT_WIDTH + rowWidth + SPACE_RIGHT,
      height: HEADER_HEIGHT + bodyHeight + BODY_PADDING_BOTTOM
    };

    const preRows = <div className="segments-cont">
      <div className="segments" style={segmentsStyle}>{segments}</div>
    </div>;
    // added extra wrapping div for pin full and single parent
    const postRows = <div className="post-body">
      <div className="highlight-cont">
        <div className="highlight" style={highlightStyle}>{highlighter}</div>
      </div>
      <div className="vertical-scroll-shadow" style={verticalScrollShadowStyle}></div>
      {datasetLoad.error ? <QueryError error={datasetLoad.error}/> : null}
      {datasetLoad.loading ? <Loader/> : null}
    </div>;

    return <div className="table">
      <div className="corner">
        <div className="corner-wrap">{segmentTitle}</div>
        {cornerSortArrow}
      </div>
      <SimpleTable
        scrollLeft={scrollLeft}
        scrollTop={scrollTop}
        rowHeight={ROW_HEIGHT}
        dataLength={flatData ? flatData.length : 0}
        headerColumns={headerColumns}
        rowWidth={rowWidthExtended}
        preRows={preRows}
        rows={rows}
        rowLeftOffset={SEGMENT_WIDTH}
        postRows={postRows}
      />
      <Scroller
        style={scrollerStyle}
        ref="base"
        onScroll={this.onScroll.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
        onClick={this.onClick.bind(this)}
      />;
      {highlightBubble}
    </div>;
  }
}
