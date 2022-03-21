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

import { Duration, Timezone } from "chronoshift";
import { AttributeInfo, Executor } from "plywood";
import { ClientDataCube, SerializedDataCube } from "../../common/models/data-cube/data-cube";
import { serialize as serializeDimensions } from "../../common/models/dimension/dimensions";
import { Filter } from "../../common/models/filter/filter";
import { serialize as serializeMeasures } from "../../common/models/measure/measures";
import { RefreshRule } from "../../common/models/refresh-rule/refresh-rule";
import { deserialize as deserializeDimensions } from "./dimensions";
import { deserialize as deserializeMeasures } from "./measures";

export function deserialize(dataCube: SerializedDataCube, executor: Executor): ClientDataCube {
  const {
    attributes,
    clusterName,
    defaultDuration,
    defaultFilter,
    defaultPinnedDimensions,
    defaultSelectedMeasures,
    defaultSortMeasure,
    defaultSplitDimensions,
    defaultTimezone,
    description,
    dimensions,
    extendedDescription,
    group,
    maxSplits,
    measures,
    name,
    options,
    refreshRule,
    rollup,
    source,
    timeAttribute,
    title
  } = dataCube;
  return {
    attributes: AttributeInfo.fromJSs(attributes),
    clusterName,
    defaultDuration: Duration.fromJS(defaultDuration),
    defaultFilter: defaultFilter && Filter.fromJS(defaultFilter),
    defaultPinnedDimensions,
    defaultSelectedMeasures,
    defaultSortMeasure,
    defaultSplitDimensions,
    defaultTimezone: Timezone.fromJS(defaultTimezone),
    description,
    dimensions: deserializeDimensions(dimensions),
    executor,
    extendedDescription,
    group,
    maxSplits,
    measures: deserializeMeasures(measures),
    name,
    options,
    refreshRule: RefreshRule.fromJS(refreshRule),
    rollup,
    source,
    timeAttribute,
    title
  };
}

/*
 NOTE: Function is used only for serialize-deserialize cycle in Essence class.
 Now it's hard to remove that functionality but in the end, Essence does not need to serialize itself.
*/
export function serialize(dataCube: ClientDataCube): SerializedDataCube {
  const {
    attributes,
    clusterName,
    defaultDuration,
    defaultFilter,
    defaultPinnedDimensions,
    defaultSelectedMeasures,
    defaultSortMeasure,
    defaultSplitDimensions,
    defaultTimezone,
    description,
    dimensions,
    extendedDescription,
    group,
    maxSplits,
    measures,
    name,
    options,
    refreshRule,
    rollup,
    source,
    timeAttribute,
    title
  } = dataCube;
  return {
    attributes: attributes.map(a => a.toJS()),
    clusterName,
    defaultDuration: defaultDuration.toJS(),
    defaultFilter: defaultFilter && defaultFilter.toJS(),
    defaultPinnedDimensions,
    defaultSelectedMeasures,
    defaultSortMeasure,
    defaultSplitDimensions,
    defaultTimezone: defaultTimezone.toJS(),
    description,
    dimensions: serializeDimensions(dimensions),
    extendedDescription,
    group,
    maxSplits,
    measures: serializeMeasures(measures),
    name,
    options,
    refreshRule: RefreshRule.fromJS(refreshRule),
    rollup,
    source,
    timeAttribute,
    title
  };
}
