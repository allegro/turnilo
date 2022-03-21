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
import { Dimension } from "../../../common/models/dimension/dimension";
import { coerceGranularity, isGranularityValid } from "../../../common/models/granularity/granularity";
import { Sort } from "../../../common/models/sort/sort";
import { Split } from "../../../common/models/split/split";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";

interface SplitAssembly {
  dimension: Dimension;
  split: Split;
  granularity?: string;
  limit?: number;
  sort?: Sort;
}

export function validateSplit(splitAssembly: SplitAssembly): boolean {
  const { granularity, split, dimension: { kind } } = splitAssembly;
  if (!isGranularityValid(kind, granularity)) {
    return false;
  }
  const newSplit = createSplit(splitAssembly);
  return !split.equals(newSplit);
}

export function createSplit({
                              split: { type, reference },
                              limit,
                              granularity,
                              sort,
                              dimension: { kind }
                            }: SplitAssembly): Split {
  const bucket = coerceGranularity(granularity, kind);
  return new Split({ type, reference, limit, sort, bucket });
}

interface SplitMenuBaseProps {
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  onSave: Fn;
  dimension: Dimension;
  isValid: boolean;
}

export class SplitMenuBase extends React.Component<SplitMenuBaseProps> {

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    const { isValid, onSave, onClose } = this.props;
    if (!isValid) return;
    onSave();
    onClose();
  };

  render() {
    const { containerStage, openOn, dimension, onClose, children, isValid } = this.props;
    if (!dimension) return null;

    return <BubbleMenu
      className="split-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
    >
      {children}
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={!isValid} onClick={this.onOkClick} title={STRINGS.ok}/>
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel}/>
      </div>
    </BubbleMenu>;
  }
}
