/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import { $, Dataset, Expression, ply, RefExpression } from "plywood";
import * as React from "react";
import { CurrentFilter, DatasetLoad, Essence, Measure, MeasureDerivation, PreviousFilter, Timekeeper, VisualizationProps } from "../../../common/models/index";
import { GlobalEventListener, Loader, QueryError } from "../../components/index";
import { SPLIT } from "../../config/constants";
import "./base-visualization.scss";

export interface BaseVisualizationState {
  datasetLoad?: DatasetLoad;
  dragOnMeasure?: Measure;
  scrollLeft?: number;
  scrollTop?: number;
  hoverMeasure?: Measure;
}

export class BaseVisualization<S extends BaseVisualizationState> extends React.Component<VisualizationProps, S> {
  public static id = "base-visualization";

  // isMounted was already taken by the superclass
  protected _isMounted: boolean;

  constructor(props: VisualizationProps) {
    super(props);

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
    const target = e.target as Element;
    this.setState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop
    } as BaseVisualizationState as S); // Geez, TypeScript
  }

  protected makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
    const { splits, colors, dataCube } = essence;
    const measures = essence.getEffectiveMeasures();

    const $main = $("main");

    const hasComparison = essence.hasComparison();
    const mainFilter = essence.getEffectiveFilter(timekeeper, { combineWithPrevious: hasComparison, highlightId: this.id });

    const currentFilter = essence.currentTimeFilter(timekeeper);
    const previousFilter = hasComparison ? essence.previousTimeFilter(timekeeper) : null;

    const mainExp: Expression = ply()
      .apply("main", $main.filter(mainFilter.toExpression()));

    function applyMeasures(query: Expression, nestingLevel = 0): Expression {
      return measures.reduce((query, measure) => {
        if (!hasComparison) {
          return query.performAction(
            measure.toApplyExpression(nestingLevel)
          );
        }
        return query
          .performAction(measure.toApplyExpression(nestingLevel, new CurrentFilter(currentFilter)))
          .performAction(measure.toApplyExpression(nestingLevel, new PreviousFilter(previousFilter)));
      }, query);
    }

    const queryWithMeasures = applyMeasures(mainExp);

    function applySplit(i: number): Expression {
      const split = splits.get(i);
      const splitDimension = dataCube.getDimensionByExpression(split.expression);
      const { sortAction, limitAction } = split;
      if (!sortAction) {
        throw new Error("something went wrong during query generation");
      }

      const currentSplit = !hasComparison ? split : split.withTimeShift(currentFilter, essence.timeShift.valueOf());
      let subQuery: Expression =
        $main.split(currentSplit.toSplitExpression(), splitDimension.name);

      if (colors && colors.dimension === splitDimension.name) {
        const havingFilter = colors.toHavingFilter(splitDimension.name);
        if (havingFilter) {
          subQuery = subQuery.performAction(havingFilter);
        }
      }

      const nestingLevel = i + 1;

      subQuery = applyMeasures(subQuery, nestingLevel);

      // It's possible to define sort on measure that's not selected thus we need to add apply expression for that measure.
      // We don't need add apply expressions for:
      //   * dimensions - they're already defined as apply expressions because of splits
      //   * selected measures - they're defined as apply expressions already
      //   * previous/delta - we need to define them earlier so they're present here
      const { name: sortMeasureName, derivation } = Measure.nominalName((sortAction.expression as RefExpression).name);
      if (sortMeasureName && derivation === MeasureDerivation.CURRENT) {
        const sortMeasure = dataCube.getMeasure(sortMeasureName);
        if (sortMeasure && !measures.contains(sortMeasure)) {
          subQuery = subQuery.performAction(sortMeasure.toApplyExpression(nestingLevel, new CurrentFilter(currentFilter)));
        }
      }
      subQuery = subQuery.performAction(sortAction);

      if (colors && colors.dimension === splitDimension.name) {
        subQuery = subQuery.performAction(colors.toLimitExpression());
      } else if (limitAction) {
        subQuery = subQuery.performAction(limitAction);
      } else if (splitDimension.kind === "number") {
        // Hack: Plywood converts groupBys to topN if the limit is below a certain threshold.  Currently sorting on dimension in a groupBy query does not
        // behave as expected and in the future plywood will handle this, but for now add a limit so a topN query is performed.
        // 5000 is just a randomly selected number that's high enough that it's not immediately obvious that there's a limit.
        subQuery = subQuery.limit(5000);
      }

      if (i + 1 < splits.length()) {
        subQuery = subQuery.apply(SPLIT, applySplit(i + 1));
      }

      return subQuery;
    }

    if (splits.length() > 0) {
      return queryWithMeasures.apply(SPLIT, applySplit(0));
    }
    return queryWithMeasures;
  }

  protected fetchData(essence: Essence, timekeeper: Timekeeper): void {
    this.precalculate(this.props, { loading: true });

    const { registerDownloadableDataset } = this.props;

    const query = this.makeQuery(essence, timekeeper);
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
        error => {
          if (registerDownloadableDataset) registerDownloadableDataset(null);
          if (!this._isMounted) return;
          this.precalculate(this.props, {
            loading: false,
            dataset: null,
            error
          });
        }
      ); // Not calling done() prevents potential error from being bubbled up
  }

  private lastRenderResult: JSX.Element = null;

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this._isMounted = true;
    const { essence, timekeeper } = this.props;
    this.fetchData(essence, timekeeper);
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    this.precalculate(nextProps);
    if (this.shouldFetchData(nextProps) && this.visualisationNotResized(nextProps)) {
      this.fetchData(nextProps.essence, nextProps.timekeeper);
    }
  }

  shouldFetchData(nextProps: VisualizationProps): boolean {
    const { essence, timekeeper } = this.props;
    const nextEssence = nextProps.essence;
    const nextTimekeeper = nextProps.timekeeper;
    return nextEssence.differentDataCube(essence) ||
      nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper, this.id) ||
      nextEssence.differentTimeShift(essence) ||
      nextEssence.differentEffectiveSplits(essence) ||
      nextEssence.differentColors(essence) ||
      nextEssence.newEffectiveMeasures(essence) ||
      nextEssence.dataCube.refreshRule.isRealtime();
  }

  visualisationNotResized(nextProps: VisualizationProps): boolean {
    return this.props.stage.equals(nextProps.stage);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  protected globalMouseMoveListener(e: MouseEvent) {
  }

  protected globalMouseUpListener(e: MouseEvent) {
  }

  protected globalKeyDownListener(e: KeyboardEvent) {
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

    return <div className={"base-visualization " + this.id}>
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
