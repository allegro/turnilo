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
import { ReactNode } from "react";
import { Nullary, Unary } from "../../../common/utils/functional/functional";

export interface DownloadableDataset {
  getDataset: Nullary<Dataset | null>;
  setDataset: Unary<Dataset, void>;
}

export const DownloadableDatasetContext = React.createContext<DownloadableDataset>({
  getDataset(): Dataset | null {
    throw new Error("Trying to fetch DownloadableDataset before Provider initialisation");
  },
  setDataset(dataset: Dataset): void {
    throw new Error("Trying to set DownloadableDataset before Provider initialisation");
  }
});

interface DownloadableDatasetProps {
  children: ReactNode;
}

export class DownloadableDatasetProvider extends React.Component<DownloadableDatasetProps> {

  private dataset?: Dataset = null;
  private value: DownloadableDataset = {
    getDataset: () => this.dataset,
    setDataset: (dataset: Dataset) => {
      this.dataset = dataset;
    }
  };

  render() {
    const { children } = this.props;
    return <DownloadableDatasetContext.Provider value={this.value}>
      {children}
    </DownloadableDatasetContext.Provider>;
  }
}
