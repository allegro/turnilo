/*
 * Copyright 2017-2021 Allegro.pl
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
import React from "react";
import {
  DatasetRequest,
  DatasetRequestStatus,
  error,
  isError,
  isLoaded,
  loaded,
  loading
} from "../../../common/models/dataset-request/dataset-request";
import { Essence } from "../../../common/models/essence/essence";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { debounceWithPromise, Unary } from "../../../common/utils/functional/functional";
import { Loader } from "../../components/loader/loader";
import { QueryError } from "../../components/query-error/query-error";
import { reportError } from "../../utils/error-reporter/error-reporter";
import { QueryCall } from "../../views/cube-view/api-context";
import { DownloadableDataset, DownloadableDatasetContext } from "../../views/cube-view/downloadable-dataset-context";

interface DataProviderProps {
  refreshRequestTimestamp: number;
  essence: Essence;
  timekeeper: Timekeeper;
  stage: Stage;
  query: QueryCall;
  children: Unary<Dataset, React.ReactNode>;
}

interface DataProviderState {
  dataset: DatasetRequest;
}

export class DataProvider extends React.Component<DataProviderProps, DataProviderState> {
  static contextType = DownloadableDatasetContext;
  context: DownloadableDataset;

  state: DataProviderState = { dataset: loading };

  private lastQueryEssence: Essence = null;

  componentDidMount() {
    const { essence } = this.props;
    this.loadData(essence);
  }

  componentWillUnmount() {
    this.lastQueryEssence = null;
    this.debouncedCallExecutor.cancel();
  }

  UNSAFE_componentWillReceiveProps(nextProps: DataProviderProps) {
    if (this.shouldFetchData(nextProps) && this.visualisationNotResized(nextProps)) {
      const { essence } = nextProps;
      const hadDataLoaded = isLoaded(this.state.dataset);
      const essenceChanged = !essence.equals(this.props.essence);
      this.loadData(essence, hadDataLoaded && essenceChanged);
    }
  }

  private loadData(essence: Essence, showSpinner = true) {
    if (showSpinner) this.handleDatasetLoad(loading);
    this.fetchData(essence)
      .then(loadedDataset => {
        // TODO: encode it better
        // null is here when we get out of order request, so we just ignore it
        if (!loadedDataset) return;
        if (isError(loadedDataset)) {
          this.handleDatasetLoad(loadedDataset);
        }
        if (isLoaded(loadedDataset)) {
          this.handleDatasetLoad(loadedDataset);
        }
      });
  }

  private fetchData(essence: Essence): Promise<DatasetRequest | null> {
    this.lastQueryEssence = essence;
    return this.debouncedCallExecutor(essence);
  }

  private callExecutor = (essence: Essence): Promise<DatasetRequest | null> =>
    this.props.query(essence)
      .then((dataset: Dataset) => {
          // signal out of order requests with null
          if (!this.wasUsedForLastQuery(essence)) return null;
          return loaded(dataset);
        },
        err => {
          // signal out of order requests with null
          if (!this.wasUsedForLastQuery(essence)) return null;
          reportError(err);
          return error(err);
        });

  private wasUsedForLastQuery(essence: Essence) {
    return essence.equals(this.lastQueryEssence);
  }

  private debouncedCallExecutor = debounceWithPromise(this.callExecutor, 500);

  private handleDatasetLoad(dataset: DatasetRequest) {
    this.setState({ dataset });
    const { setDataset } = this.context;
    setDataset(isLoaded(dataset) ? dataset.dataset : null);
  }

  protected shouldFetchData(nextProps: DataProviderProps): boolean {
    return this.differentVisualizationDefinition(nextProps);
  }

  private differentVisualizationDefinition(nextProps: DataProviderProps) {
    const { essence, timekeeper } = this.props;
    const nextEssence = nextProps.essence;
    const nextTimekeeper = nextProps.timekeeper;
    return nextEssence.differentDataCube(essence) ||
      nextEssence.differentEffectiveFilter(essence, timekeeper, nextTimekeeper) ||
      nextEssence.differentTimeShift(essence) ||
      nextEssence.differentSplits(essence) ||
      nextEssence.differentSeries(essence) ||
      nextEssence.differentSettings(essence) ||
      this.differentBucketingTimezone(nextEssence) ||
      this.differentLastRefreshRequestTimestamp(nextProps);
  }

  private differentBucketingTimezone(newEssence: Essence): boolean {
    const { essence } = this.props;
    return !essence.timezone.equals(newEssence.timezone) && newEssence.splits.hasSplitOn(essence.getTimeDimension());
  }

  private differentLastRefreshRequestTimestamp({ refreshRequestTimestamp }: DataProviderProps): boolean {
    return refreshRequestTimestamp !== this.props.refreshRequestTimestamp;
  }

  private visualisationNotResized(nextProps: DataProviderProps): boolean {
    return this.props.stage.equals(nextProps.stage);
  }

  render() {
    const { children } = this.props;
    const { dataset } = this.state;
    switch (dataset.status) {
      case DatasetRequestStatus.LOADING:
        return <Loader/>;
      case DatasetRequestStatus.ERROR:
        return <QueryError error={dataset.error}/>;
      case DatasetRequestStatus.LOADED:
        return children(dataset.dataset);
    }
  }
}
