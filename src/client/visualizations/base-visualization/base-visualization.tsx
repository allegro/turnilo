require('./base-visualization.css');

import * as React from 'react';
import { $, ply, TimeRange, Expression, Dataset } from 'plywood';
import {
  MeasureModeNeeded,
  Manifest,
  Measure,
  VisualizationProps,
  DatasetLoad,
  Splits,
  DataSource,
  Colors,
  Resolve,
  Essence
} from '../../../common/models/index';

import { SPLIT } from '../../config/constants';

import { Loader } from '../../components/loader/loader';
import { QueryError } from '../../components/query-error/query-error';


export interface BaseVisualizationState {
  datasetLoad?: DatasetLoad;
  dragOnMeasure?: Measure;
  scrollLeft?: number;
  scrollTop?: number;
  hoverMeasure?: Measure;
}

export class BaseVisualization<S extends BaseVisualizationState>
  extends React.Component<VisualizationProps, S> {

  public static id = 'base-visualization';
  public static title = 'Base Visualization';

  public static measureModeNeed: MeasureModeNeeded = 'any';

  public static handleCircumstance(
    dataSource: DataSource, splits: Splits, colors: Colors, current: boolean
  ): Resolve {
    return Resolve.NEVER;
  }

  // isMounted was already taken by the superclass
  protected _isMounted: boolean;

  constructor() {
    super();

    this.state = this.getDefaultState() as S;

    this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
    this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
    this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
  }

  getDefaultState(): BaseVisualizationState {
    return {
      datasetLoad: {},
      scrollLeft: 0,
      scrollTop: 0,
      hoverMeasure: null
    };
  }

  // Way to get a static property without explicitly specifying the class
  protected get id(): string {
    return (this.constructor as any).id;
  }

  protected makeQuery(essence: Essence): Expression {
    var { splits, colors, dataSource } = essence;
    var measures = essence.getEffectiveMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(this.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeSubQuery(i: number): Expression {
      var split = splits.get(i);
      var splitDimension = dataSource.getDimensionByExpression(split.expression);
      var { sortAction, limitAction } = split;
      if (!sortAction) {
        throw new Error('something went wrong during query generation');
      }

      var subQuery: Expression = $main.split(split.toSplitExpression(), splitDimension.name);

      if (colors && colors.dimension === splitDimension.name) {
        var havingFilter = colors.toHavingFilter(splitDimension.name);
        if (havingFilter) {
          subQuery = subQuery.performAction(havingFilter);
        }
      }

      measures.forEach((measure) => {
        subQuery = subQuery.performAction(measure.toApplyAction());
      });

      var applyForSort = essence.getApplyForSort(sortAction);
      if (applyForSort) {
        subQuery = subQuery.performAction(applyForSort);
      }
      subQuery = subQuery.performAction(sortAction);

      if (colors && colors.dimension === splitDimension.name) {
        subQuery = subQuery.performAction(colors.toLimitAction());
      } else if (limitAction) {
        subQuery = subQuery.performAction(limitAction);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, makeSubQuery(i + 1));
      }

      return subQuery;
    }

    return query.apply(SPLIT, makeSubQuery(0));
  }

  protected fetchData(essence: Essence): void {
    var { registerDownloadableDataset } = this.props;

    let query = this.makeQuery(essence);

    this.precalculate(this.props, { loading: true });
    essence.dataSource.executor(query, { timezone: essence.timezone })
      .then(
        (dataset: Dataset) => {
          if (!this._isMounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset,
            error: null
          });
        },
        (error) => {
          registerDownloadableDataset(null);
          if (!this._isMounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset: null,
            error
          });
        }
      );
  }

  private lastRenderResult: JSX.Element = null;

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this._isMounted = true;
    var { essence } = this.props;
    this.fetchData(essence);

    window.addEventListener('keydown', this.globalKeyDownListener);
    window.addEventListener('mousemove', this.globalMouseMoveListener);
    window.addEventListener('mouseup', this.globalMouseUpListener);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.precalculate(nextProps);
    var { essence } = this.props;
    var nextEssence = nextProps.essence;
    if (
      nextEssence.differentDataSource(essence) ||
      nextEssence.differentEffectiveFilter(essence, this.id) ||
      nextEssence.differentEffectiveSplits(essence) ||
      nextEssence.differentColors(essence) ||
      nextEssence.newEffectiveMeasures(essence)
    ) {
      this.fetchData(nextEssence);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    window.removeEventListener('keydown', this.globalKeyDownListener);
    window.removeEventListener('mousemove', this.globalMouseMoveListener);
    window.removeEventListener('mouseup', this.globalMouseUpListener);
  }

  protected globalMouseMoveListener(e: MouseEvent) {}
  protected globalMouseUpListener(e: MouseEvent) {}
  protected globalKeyDownListener(e: KeyboardEvent) {}

  protected onScroll(e: UIEvent) {
    var target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    } as BaseVisualizationState as S); // Geez, TypeScript
  }

  protected renderInternals(): JSX.Element {
    return null;
  }

  protected precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {

  }

  render() {
    let { datasetLoad } = this.state;

    if (!datasetLoad.loading || !this.lastRenderResult) {
      this.lastRenderResult = this.renderInternals();
    }

    return <div className={'base-visualization ' + this.id}>
      {this.lastRenderResult}
      {datasetLoad.error ? <QueryError error={datasetLoad.error}/> : null}
      {datasetLoad.loading ? <Loader/> : null}
    </div>;
  }
}
