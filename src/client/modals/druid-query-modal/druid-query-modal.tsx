/*
 * Copyright 2017-2019 Allegro.pl
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

import { External } from "plywood";
import React from "react";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import standardQuery from "../../../common/utils/query/visualization-query";
import gridQuery from "../../visualizations/grid/make-query";
import { SourceModal } from "../source-modal/source-modal";

interface DruidQueryModalProps {
  onClose: Fn;
  essence: Essence;
  timekeeper: Timekeeper;
}

export const DruidQueryModal: React.FunctionComponent<DruidQueryModalProps> = ({ onClose, timekeeper, essence }) => {
  const { visualization, dataCube: { attributes, source, options: { customAggregations, customTransforms } } } = essence;
  const queryFn = visualization.name === "grid" ? gridQuery : standardQuery;
  const query = queryFn(essence, timekeeper);
  const external = External.fromJS({ engine: "druid", attributes, source, customAggregations, customTransforms });
  let plan;
  try {
    plan = JSON.stringify(query.simulateQueryPlan({ main: external }), null, 2);
  } catch (e) {
    plan = "Couldn't create Druid Query Plan.";
  }

  return <SourceModal
    onClose={onClose}
    title="Druid query"
    copyLabel="Copy query"
    source={plan} />;
};
