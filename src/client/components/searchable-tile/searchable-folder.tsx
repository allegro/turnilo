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

import * as React from "react";
import { PureComponent } from "react";
import { classNames } from "../../utils/dom/dom";
import { InfoBubble } from "../info-bubble/info-bubble";
import { SvgIcon } from "../svg-icon/svg-icon";
import "./searchable-folder.scss";

export interface SearchableFolderProps {
  name: string;
  title: string;
  description?: string;
  inSearchMode: boolean;
  hasItemsWithSearchText: boolean;
  shouldBeOpened: boolean;
}

export interface SearchableFolderState {
  opened: boolean;
}

export class SearchableFolder extends PureComponent<SearchableFolderProps, SearchableFolderState> {

  readonly state: SearchableFolderState;

  private readonly openIcon = <SvgIcon svg={require("../../icons/full-caret-small-bottom.svg")} />;
  private readonly closedIcon = <SvgIcon svg={require("../../icons/full-caret-small-right.svg")} />;

  constructor(props: SearchableFolderProps) {
    super(props);

    const { inSearchMode, hasItemsWithSearchText, shouldBeOpened } = this.props;
    this.state = { opened: inSearchMode && hasItemsWithSearchText || shouldBeOpened };
  }

  componentWillReceiveProps(nextProps: Readonly<SearchableFolderProps>) {
    const { opened } = this.state;
    const { shouldBeOpened } = this.props;

    const shouldOpen = !opened && !shouldBeOpened && nextProps.shouldBeOpened;
    if (shouldOpen) {
      this.setState({ opened: shouldOpen });
    }
  }

  handleClick = () => {
    this.setState(prevState => ({ opened: !prevState.opened }));
  };

  render() {
    const { title, description, inSearchMode, hasItemsWithSearchText, children } = this.props;
    const { opened } = this.state;

    const isGroupOpen = opened || inSearchMode && hasItemsWithSearchText;
    const hidden = inSearchMode && !hasItemsWithSearchText;

    return <div className={classNames("folder", { hidden })}>
      <div className="folder-header">
        <div className="icon-label-container" onClick={this.handleClick}>
          <div className="folder-icon">
            {isGroupOpen ? this.openIcon : this.closedIcon}
          </div>
          <span className="label">{title}</span>
        </div>
        {description && <InfoBubble className="info-icon" description={description} />}
      </div>
      <div className={classNames("folder-items", { closed: !isGroupOpen })}>
        {children}
      </div>
    </div>;
  }
}
