/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as React from "react";
import { Clicker } from "../../../../common/models/clicker/clicker";
import { Dimension } from "../../../../common/models/dimension/dimension";
import { Essence } from "../../../../common/models/essence/essence";
import { isTimeFilter, RelativeTimeFilterClause } from "../../../../common/models/filter-clause/filter-clause";
import { Stage } from "../../../../common/models/stage/stage";
import { Timekeeper } from "../../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../../common/utils/general/general";
import { STRINGS } from "../../../config/constants";
import { BubbleMenu } from "../../bubble-menu/bubble-menu";
import { ButtonGroup } from "../../button-group/button-group";
import { FixedTimeTab } from "./fixed-time-tab";
import { PresetTimeTab } from "./preset-time-tab";
import "./time-filter-menu.scss";

const MENU_WIDTH = 250;

export interface TimeFilterMenuProps {
  clicker: Clicker;
  timekeeper: Timekeeper;
  essence: Essence;
  dimension: Dimension;
  onClose: Fn;
  containerStage?: Stage;
  openOn: Element;
  inside?: Element;
}

enum TimeFilterTab { RELATIVE = "relative", FIXED = "fixed"}

export interface TimeFilterMenuState {
  tab: TimeFilterTab;
}

function initialTab({ essence: { filter }, dimension: { name } }: TimeFilterMenuProps): TimeFilterTab {
  const clause = filter.clauseForReference(name);
  if (clause && !isTimeFilter(clause)) {
    throw new Error(`Expected TimeFilter. Got ${clause}`);
  }
  const isRelativeClause = !clause || clause instanceof RelativeTimeFilterClause;
  return isRelativeClause ? TimeFilterTab.RELATIVE : TimeFilterTab.FIXED;
}

export class TimeFilterMenu extends React.Component<TimeFilterMenuProps, TimeFilterMenuState> {

  state: TimeFilterMenuState = { tab: initialTab(this.props) };

  selectTab(tab: TimeFilterTab) {
    this.setState({ tab });
  }

  render() {
    const { essence, timekeeper, clicker, dimension, onClose, containerStage, openOn, inside } = this.props;
    const { tab } = this.state;
    if (!dimension) return null;
    const menuSize = Stage.fromSize(MENU_WIDTH, 410);

    const tabs = [TimeFilterTab.RELATIVE, TimeFilterTab.FIXED].map(name => {
      return {
        isSelected: tab === name,
        title: (name === TimeFilterTab.RELATIVE ? STRINGS.relative : STRINGS.fixed),
        key: name,
        onClick: () => this.selectTab(name)
      };
    });
    const tabProps = { essence, dimension, timekeeper, onClose, clicker };
    return <BubbleMenu
      className="time-filter-menu"
      direction="down"
      containerStage={containerStage}
      stage={menuSize}
      openOn={openOn}
      onClose={onClose}
      inside={inside}
    >
      <ButtonGroup groupMembers={tabs} />
      {tab === TimeFilterTab.RELATIVE ? <PresetTimeTab {...tabProps} /> : <FixedTimeTab {...tabProps} />}
    </BubbleMenu>;
  }
}
