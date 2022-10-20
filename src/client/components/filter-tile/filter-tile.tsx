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
import { FilterClause, isTimeFilter } from "../../../common/models/filter-clause/filter-clause";
import { Locale } from "../../../common/models/locale/locale";
import { Stage } from "../../../common/models/stage/stage";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { getFormattedClause } from "../../../common/utils/formatter/formatter";
import { Ternary, Unary } from "../../../common/utils/functional/functional";
import { Fn } from "../../../common/utils/general/general";
import { classNames } from "../../utils/dom/dom";
import { FilterMenu } from "../filter-menu/filter-menu";
import { SvgIcon } from "../svg-icon/svg-icon";
import { WithRef } from "../with-ref/with-ref";
import { FilterClauseLabel } from "./filter-clause-label";
import timeShiftLabel from "./time-shift-label";

function tileTitle(dimension: Dimension, clause: FilterClause, essence: Essence): string {
  const { title, values } = getFormattedClause(dimension, clause, essence.timezone);
  const timeShift = timeShiftLabel(dimension, essence);

  return `${title} ${values} ${timeShift || ""}`;
}

interface FilterTileProps {
  clause: FilterClause;
  open: boolean;
  dimension: Dimension;
  style?: React.CSSProperties;
  removeClause?: Unary<FilterClause, void>;
  saveClause: Unary<FilterClause, void>;
  openFilterMenu: Unary<FilterClause, void>;
  closeFilterMenu: Fn;
  dragStart: Ternary<Dimension, FilterClause, React.DragEvent<HTMLElement>, void>;
  stage: Stage;
  essence: Essence;
  timekeeper: Timekeeper;
  locale: Locale;
  clicker: Clicker;
}

export const FILTER_CLASS_NAME = "filter";

export const FilterTile: React.FunctionComponent<FilterTileProps> = props => {
  const {
    clause,
    open,
    dimension,
    style,
    removeClause,
    saveClause,
    openFilterMenu,
    closeFilterMenu,
    dragStart,
    stage,
    essence,
    locale,
    timekeeper,
    clicker
  } = props;

  const excluded = clause && !isTimeFilter(clause) && clause.not;
  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className={classNames("tile dimension", {
          selected: open,
          excluded,
          included: !excluded
        })}
        draggable={true}
        ref={setRef}
        onClick={() => openFilterMenu(clause)}
        onDragStart={e => dragStart(dimension, clause, e)}
        style={style}
        title={tileTitle(dimension, clause, essence)}
      >
        <FilterClauseLabel dimension={dimension} clause={clause} essence={essence} />
        {removeClause && <div className="remove" onClick={() => removeClause(clause)}>
          <SvgIcon svg={require("../../icons/x.svg")} />
        </div>}
      </div>
      {open && openOn && <FilterMenu
        containerStage={stage}
        essence={essence}
        timekeeper={timekeeper}
        locale={locale}
        clicker={clicker}
        saveClause={saveClause}
        openOn={openOn}
        dimension={dimension}
        onClose={closeFilterMenu} />}
    </React.Fragment>}
  </WithRef>;
};
