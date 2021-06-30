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

import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { isTimeAttribute } from "../../../common/models/data-cube/data-cube";
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

function renderTimeShiftLabel(dimension: Dimension, essence: Essence): string {
  if (!isTimeAttribute(essence.dataCube, dimension.expression)) return null;
  if (!essence.hasComparison()) return null;
  return `(Shift: ${essence.timeShift.getDescription(true)})`;
}

function renderLabel(dimension: Dimension, clause: FilterClause, essence: Essence): JSX.Element {
  const { title, values } = getFormattedClause(dimension, clause, essence.timezone);
  const timeShift = renderTimeShiftLabel(dimension, essence);

  return <div className="reading">
    {title ? <span className="dimension-title">{title}</span> : null}
    <span className="values">{values} {timeShift}</span>
  </div>;
}

export const FILTER_CLASS_NAME = "filter";

export const FilterTile: React.SFC<FilterTileProps> = props => {
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

  const label = renderLabel(dimension, clause, essence);

  const excluded = clause && !isTimeFilter(clause) && clause.not;
  return <WithRef>
    {({ ref: openOn, setRef }) => <React.Fragment>
      <div
        className={classNames(FILTER_CLASS_NAME, "dimension", {
          selected: open,
          excluded,
          included: !excluded
        })}
        draggable={true}
        ref={setRef}
        onClick={() => openFilterMenu(clause)}
        onDragStart={e => dragStart(dimension, clause, e)}
        style={style}>
        {label}
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
