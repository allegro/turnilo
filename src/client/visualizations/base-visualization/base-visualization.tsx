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

import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Measure } from "../../../common/models/measure/measure";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { DatasetLoad, error, isError, isLoaded, isLoading, loaded, loading, VisualizationProps } from "../../../common/models/visualization-props/visualization-props";
import { debounce, noop } from "../../../common/utils/functional/functional";
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

  // Way to get a static property without explicitly specifying the class
  protected get id(): string {
    return (this.constructor as any).id;
  }

  constructor(props: VisualizationProps) {
    super(props);

    this.state = this.getDefaultState() as S;
  }

  protected getDefaultState(): BaseVisualizationState {
    return {
      datasetLoad: loading,
      scrollLeft: 0,
      scrollTop: 0,
      hoverMeasure: null
    };
  }

  protected globalMouseMoveListener: (e: MouseEvent) => void = noop;

  protected globalMouseUpListener: (e: MouseEvent) => void = noop;

  protected globalKeyDownListener: (e: KeyboardEvent) => void = noop;

  private lastQueryEssence: Essence = null;

  componentDidMount() {
    const { essence, timekeeper } = this.props;
    this.fetchData(essence, timekeeper);
  }

  componentWillUnmount() {
    this.lastQueryEssence = null;
    this.debouncedCallExecutor.cancel();
  }

  componentWillReceiveProps(nextProps: VisualizationProps) {
    if (this.shouldFetchData(nextProps) && this.visualisationNotResized(nextProps)) {
      this.fetchData(nextProps.essence, nextProps.timekeeper);
    }
  }

  protected fetchData(essence: Essence, timekeeper: Timekeeper): void {
    this.lastQueryEssence = essence;
    this.handleDatasetLoad(loading);

    this.debouncedCallExecutor(essence, timekeeper);
  }

  private callExecutor = (essence: Essence, timekeeper: Timekeeper) =>
    essence.dataCube.executor(makeQuery(essence, timekeeper), { timezone: essence.timezone })
      .then((dataset: Dataset) => {
          if (!this.wasUsedForLastQuery(essence)) return;
          this.precalculate(this.props, dataset);
          this.handleDatasetLoad(loaded(dataset));
        },
        err => {
          if (!this.wasUsedForLastQuery(essence)) return;
          this.handleDatasetLoad(error(err));
        })

  private wasUsedForLastQuery(essence: Essence) {
    return essence.equals(this.lastQueryEssence);
  }

  private debouncedCallExecutor = debounce(this.callExecutor, 500);

  private handleDatasetLoad(dl: DatasetLoad) {
    this.setState({ datasetLoad: dl });
    const { registerDownloadableDataset } = this.props;
    if (registerDownloadableDataset) {
      registerDownloadableDataset(isLoaded(dl) ? dl.dataset : null);
    }
  }

  protected shouldFetchData(nextProps: VisualizationProps): boolean {
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

  private visualisationNotResized(nextProps: VisualizationProps): boolean {
    return this.props.stage.equals(nextProps.stage);
  }

  protected renderInternals(dataset: Dataset): JSX.Element {
    return null;
  }

  protected precalculate(props: VisualizationProps, dataset: Dataset) {
  }

  render() {
    const { datasetLoad } = this.state;

    return <div className={"base-visualization " + this.id}>
      <GlobalEventListener
        mouseMove={this.globalMouseMoveListener}
        mouseUp={this.globalMouseUpListener}
        keyDown={this.globalKeyDownListener} />
      {isLoaded(datasetLoad) && this.renderInternals(datasetLoad.dataset)}
      {isError(datasetLoad) && <QueryError error={datasetLoad.error} />}
      {isLoading(datasetLoad) && <Loader />}
    </div>;
  }
}
