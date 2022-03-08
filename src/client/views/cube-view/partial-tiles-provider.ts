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

import React from "react";
import { ReactNode } from "react";
import { Dimension } from "../../../common/models/dimension/dimension";
import { DragPosition } from "../../../common/models/drag-position/drag-position";
import { Series } from "../../../common/models/series/series";
import { Binary, Omit, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";

interface PartialTilesContext {
  addSeries: Binary<Series, DragPosition, void>;
  addFilter: Binary<Dimension, DragPosition, void>;
  removeTile: Fn;
  series?: PartialSeries;
  filter?: PartialFilter;
}

interface PartialTilesProviderProps {
  children: Unary<PartialTilesContext, ReactNode>;
}

interface PartialSeriesTile {
  kind: "series";
  series: Series;
  position: DragPosition;
}

export type PartialSeries = Omit<PartialSeriesTile, "kind">;

interface PartialFilterTile {
  kind: "filter";
  dimension: Dimension;
  position: DragPosition;
}

export type PartialFilter = Omit<PartialFilterTile, "kind">;

type PartialTile = PartialFilterTile | PartialSeriesTile;

interface PartialTilesProviderState {
  tile?: PartialTile;
}

export class PartialTilesProvider extends React.Component<PartialTilesProviderProps, PartialTilesProviderState> {
  state: PartialTilesProviderState = { tile: null };

  private removeTile = () => {
    this.setState({ tile: null });
  };

  private addFilter = (dimension: Dimension, position: DragPosition) => {
    this.setState({
      tile: {
        kind: "filter",
        dimension,
        position
      }
    });
  };

  private addSeries = (series: Series, position: DragPosition) => {
    this.setState({
      tile: {
        kind: "series",
        series,
        position
      }
    });
  };

  render() {
    const { children } = this.props;
    const { tile } = this.state;
    const series = tile && tile.kind === "series" ? tile : null;
    const filter = tile && tile.kind === "filter" ? tile : null;
    return children({
      removeTile: this.removeTile,
      addFilter: this.addFilter,
      addSeries: this.addSeries,
      filter,
      series
    });
  }
}
