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

require('./base-visualization.css');

import * as React from 'react';
import { $, ply, Expression, Dataset } from 'plywood';
import { Measure, VisualizationProps, DatasetLoad, Essence, Timekeeper } from '../../../common/models/index';

import { SPLIT } from '../../config/constants';

import { Loader, GlobalEventListener, QueryError } from '../../components/index';

export interface BaseVisualizationState {
  datasetLoad?: DatasetLoad;
  dragOnMeasure?: Measure;
  scrollLeft?: number;
  scrollTop?: number;
  hoverMeasure?: Measure;
}

export class BaseVisualization<S extends BaseVisualizationState> extends React.Component<VisualizationProps, S> {
  public static id = 'base-visualization';

  // isMounted was already taken by the superclass
  protected _isMounted: boolean;

  constructor() {
    super();

    this.state = this.getDefaultState() as S;
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

  protected onScroll(e: UIEvent) {
    var target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    } as BaseVisualizationState as S); // Geez, TypeScript
  }

  protected makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
    var { splits, colors, dataCube } = essence;
    var measures = essence.getEffectiveMeasures();

    var $main = $('main');

    var query = ply()
      .apply('main', $main.filter(essence.getEffectiveFilter(timekeeper, this.id).toExpression()));

    measures.forEach((measure) => {
      query = query.performAction(measure.toApplyAction());
    });

    function makeSubQuery(i: number): Expression {
      var split = splits.get(i);
      var splitDimension = dataCube.getDimensionByExpression(split.expression);
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
      } else if (splitDimension.kind === 'number') {
      // Hack: Plywood converts groupBys to topN if the limit is below a certain threshold.  Currently sorting on dimension in a groupBy query does not
      // behave as expected and in the future plywood will handle this, but for now add a limit so a topN query is performed.
      // 5000 is just a randomly selected number that's high enough that it's not immediately obvious that there's a limit.
        subQuery = subQuery.limit(5000);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, makeSubQuery(i + 1));
      }

      return subQuery;
    }

    return query.apply(SPLIT, makeSubQuery(0));
  }

  protected fetchData(essence: Essence, timekeeper: Timekeeper): void {
    var { registerDownloadableDataset } = this.props;

    let query = this.makeQuery(essence, timekeeper);

    this.precalculate(this.props, { loading: true });
    essence.dataCube.executor(query, { timezone: essence.timezone })
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
          if (registerDownloadableDataset) registerDownloadableDataset(null);
          if (!this._isMounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset: null,
            error
          });
        }
      ).done(); // Not calling done() prevents potential error from being bubbled up
  }

  private lastRenderResult: JSX.Element = null;

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this._isMounted = true;
    var { essence, timekeeper } = this.props;
    this.fetchData(essence, timekeeper);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.precalculate(nextProps);
    var { essence, timekeeper } = this.props;
    var nextEssence = nextProps.essence;
    var nextTimekeeper = nextProps.timekeeper;
    if (
      nextEssence.differentDataCube(essence) ||
      nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper, this.id) ||
      nextEssence.differentEffectiveSplits(essence) ||
      nextEssence.differentColors(essence) ||
      nextEssence.newEffectiveMeasures(essence)
    ) {
      this.fetchData(nextEssence, nextTimekeeper);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  protected globalMouseMoveListener(e: MouseEvent) {}
  protected globalMouseUpListener(e: MouseEvent) {}
  protected globalKeyDownListener(e: KeyboardEvent) {}

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
      <GlobalEventListener
        mouseMove={this.globalMouseMoveListener.bind(this)}
        mouseUp={this.globalMouseUpListener.bind(this)}
        keyDown={this.globalKeyDownListener.bind(this)}
      />
      {this.lastRenderResult}
      {datasetLoad.error ? <QueryError error={datasetLoad.error}/> : null}
      {datasetLoad.loading ? <Loader/> : null}
    </div>;
  }
}
