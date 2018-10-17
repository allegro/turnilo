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

import { Dataset, Expression } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad, VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import makeQuery from "../../../common/utils/query/visualization-query";
import { GlobalEventListener } from "../../components/global-event-listener/global-event-listener";
import { Loader } from "../../components/loader/loader";
import { QueryError } from "../../components/query-error/query-error";
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
    return makeQuery(essence, timekeeper);
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
      nextEssence.differentSplits(essence) ||
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
      {datasetLoad.error ? <QueryError error={datasetLoad.error} /> : null}
      {datasetLoad.loading ? <Loader /> : null}
    </div>;
  }
}
