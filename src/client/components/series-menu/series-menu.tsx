/*
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

import * as React from "react";
import { DataCube } from "../../../common/models/data-cube/data-cube";
import { ExpressionSeriesDefinition, MeasureSeriesDefinition, QuantileSeriesDefinition, SeriesDefinition } from "../../../common/models/series/series-definition";
import { Stage } from "../../../common/models/stage/stage";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { ExpressionSeriesMenu } from "./expression-series-menu/expression-series-menu";
import { MeasureSeriesMenu } from "./measure-series-menu/measure-series-menu";
import { QuantileSeriesMenu } from "./quantile-series-menu/quantile-series-menu";

interface SeriesMenuProps {
  onSave: Unary<SeriesDefinition, void>;
  dataCube: DataCube;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  series: SeriesDefinition;
  inside?: Element;
}

export const SeriesMenu: React.SFC<SeriesMenuProps> = (props: SeriesMenuProps) => {
  const { dataCube, series } = props;
  const measure = dataCube.getMeasure(series.reference);
  if (!measure) return null;
  if (series instanceof MeasureSeriesDefinition) {
    // Typescript don't understand that series inside props must be MeasureSeriesDefinition thus reassign
    const measureProps = { ...props, series, measure };
    return <MeasureSeriesMenu {...measureProps} />;
  }
  if (series instanceof QuantileSeriesDefinition) {
    const quantileProps = { ...props, series, measure };
    return <QuantileSeriesMenu {...quantileProps} />;
  }
  if (series instanceof ExpressionSeriesDefinition) {
    const expressionProps = { ...props, series, measure };
    return <ExpressionSeriesMenu {...expressionProps} />;
  }
  throw new Error(`Unrecognized Series Definition: ${series}`);
};
