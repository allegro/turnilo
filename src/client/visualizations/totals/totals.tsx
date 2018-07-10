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

import { $, Expression, ply } from "plywood";
import * as React from "react";
import { TOTALS_MANIFEST } from "../../../common/manifests/totals/totals";
import { DatasetLoad, Essence, Measure, Timekeeper, VisualizationProps } from "../../../common/models/index";
import { Period } from "../../../common/models/periods/periods";
import { classNames } from "../../utils/dom/dom";
import { deltaElement } from "../../utils/format-delta/format-delta";
import { BaseVisualization, BaseVisualizationState } from "../base-visualization/base-visualization";
import "./totals.scss";

const PADDING_H = 60;
const TOTAL_WIDTH = 176;

export class Totals extends BaseVisualization<BaseVisualizationState> {
  public static id = TOTALS_MANIFEST.name;

  componentWillMount() {
    this.precalculate(this.props);
  }

  componentDidMount() {
    this._isMounted = true;
    const { essence, timekeeper } = this.props;
    this.fetchData(essence, timekeeper);
  }

  shouldFetchData(nextProps: VisualizationProps): boolean {
    const { essence, timekeeper } = this.props;
    const nextEssence = nextProps.essence;
    const nextTimekeeper = nextProps.timekeeper;
    return nextEssence.differentDataCube(essence) ||
      nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper, Totals.id) ||
      nextEssence.newEffectiveMeasures(essence) ||
      nextEssence.dataCube.refreshRule.isRealtime();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  makeQuery(essence: Essence, timekeeper: Timekeeper): Expression {
    const combineWithPrevious = essence.hasComparison();

    const mainExp: Expression = ply()
      .apply("main", $("main").filter(essence.getEffectiveFilter(timekeeper, { combineWithPrevious, highlightId: Totals.id }).toExpression()));

    const previousFilter = essence.previousTimeFilter(timekeeper);
    const currentFilter = essence.currentTimeFilter(timekeeper);

    return essence.getEffectiveMeasures().reduce((query, measure) => {
      if (!essence.hasComparison()) {
        return query.performAction(
          measure.toApplyExpression()
        );
      } else {
        return query
          .performAction(measure.filteredApplyExpression(Period.CURRENT, currentFilter))
          .performAction(measure.filteredApplyExpression(Period.PREVIOUS, previousFilter));
      }
    }, mainExp);
  }

  precalculate(props: VisualizationProps, datasetLoad: DatasetLoad = null) {
    const { registerDownloadableDataset, essence } = props;
    const { splits } = essence;

    const existingDatasetLoad = this.state.datasetLoad;
    const newState: BaseVisualizationState = {};
    if (datasetLoad) {
      // Always keep the old dataset while loading
      if (datasetLoad.loading) datasetLoad.dataset = existingDatasetLoad.dataset;

      newState.datasetLoad = datasetLoad;
    } else {
      datasetLoad = existingDatasetLoad;
    }

    const { dataset } = datasetLoad;
    if (dataset && splits.length()) {
      if (registerDownloadableDataset) registerDownloadableDataset(dataset);
    }

    this.setState(newState);
  }

  printDelta(currentValue: number, previousValue: number, measure: Measure): JSX.Element {
    if (currentValue === undefined || previousValue === undefined) {
      return null;
    }
    return <div className="measure-delta-value">
      {deltaElement(currentValue, previousValue, measure.formatFn)}
    </div>;
  }

  renderInternals() {
    const { essence, stage } = this.props;
    const { datasetLoad: { dataset } } = this.state;

    const myDatum = dataset ? dataset.data[0] : null;
    const measures = essence.getEffectiveMeasures();
    const previous = essence.hasComparison();
    const single = measures.size === 1;

    const totals = measures.map(measure => {
      let measureValueStr = "-";
      let previousElement: JSX.Element;
      if (myDatum) {
        const currentValue = myDatum[measure.name] as number;
        measureValueStr = measure.formatFn(currentValue);
        if (previous) {
          const previousValue = myDatum[measure.nameWithPeriod(Period.PREVIOUS)] as number;

          previousElement = <div className="measure-value measure-value--previous">
            {measure.formatFn(previousValue)}
            {this.printDelta(currentValue, previousValue, measure)}
          </div>;
        }
      }

      return <div
        className={classNames("total", { single })}
        key={measure.name}
      >
        <div className="measure-name">{measure.title}</div>
        <div className="measure-value">{measureValueStr}</div>
        {previous ? previousElement : null}
      </div>;
    });

    let totalContainerStyle: React.CSSProperties = null;
    if (!single) {
      const numColumns = Math.min(totals.size, Math.max(1, Math.floor((stage.width - 2 * PADDING_H) / TOTAL_WIDTH)));
      let containerWidth = numColumns * TOTAL_WIDTH;
      totalContainerStyle = {
        left: "50%",
        width: containerWidth,
        marginLeft: -containerWidth / 2
      };
    }

    return <div className="internals">
      <div className="total-container" style={totalContainerStyle}>
        {totals}
      </div>
    </div>;
  }
}
