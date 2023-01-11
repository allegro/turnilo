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
import { Clicker } from "../../../common/models/clicker/clicker";
import { Dimension } from "../../../common/models/dimension/dimension";
import { Essence } from "../../../common/models/essence/essence";
import { FilterClause } from "../../../common/models/filter-clause/filter-clause";
import { Locale } from "../../../common/models/locale/locale";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { FilterMenu } from "../filter-menu/filter-menu";
import { WithRef } from "../with-ref/with-ref";

interface PartialFilterTileProps {
  dimension: Dimension;
  style?: React.CSSProperties;
  essence: Essence;
  timekeeper: Timekeeper;
  locale: Locale;
  clicker: Clicker;
  saveClause: Unary<FilterClause, void>;
  stage: Stage;
  closeItem: Fn;
}

export const PartialFilterTile: React.FunctionComponent<PartialFilterTileProps> = props => {
  const { closeItem, saveClause, essence, timekeeper, locale, clicker, stage, dimension, style } = props;
  return <WithRef>
    {({ ref: openOn, setRef }) => <div
      className={"tile dimension selected included"}
      ref={setRef}
      style={style}>
      <div className="reading">{dimension.title}</div>
      {openOn && <FilterMenu
        essence={essence}
        timekeeper={timekeeper}
        locale={locale}
        clicker={clicker}
        saveClause={saveClause}
        openOn={openOn}
        dimension={dimension}
        containerStage={stage}
        onClose={closeItem} />}
        </div>}
  </WithRef>;
};
