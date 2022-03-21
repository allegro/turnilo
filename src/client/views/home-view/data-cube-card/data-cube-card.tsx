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

import React from "react";
import { MarkdownNode } from "../../../components/markdown-node/markdown-node";
import { SvgIcon } from "../../../components/svg-icon/svg-icon";
import { STRINGS } from "../../../config/constants";
import "./data-cube-card.scss";

export interface DataCubeCardProps {
  title: string;
  count?: number;
  extendedDescription?: string;
  description: string;
  icon: string;
  onClick: () => void;
}

export interface DataCubeCardState {
  showingMore: boolean;
}

export class DataCubeCard extends React.Component<DataCubeCardProps, DataCubeCardState> {

  state = { showingMore: false };

  showLess = () => {
    this.setState({ showingMore: false });
  };

  showMore = () => {
    this.setState({ showingMore: true });
  };

  renderDescription() {
    const { description, extendedDescription } = this.props;
    if (!extendedDescription) {
      return <MarkdownNode markdown={description || STRINGS.noDescription} />;
    }

    const { showingMore } = this.state;
    const content = showingMore ? `${description}\n\n${extendedDescription}` : description;
    const actionLabel = showingMore ? "Show less" : "Show more";
    const action = showingMore ? this.showLess : this.showMore;

    return <React.Fragment>
      <MarkdownNode markdown={content} />
      <div className="show-more-action" onClick={action}>{actionLabel}</div>
    </React.Fragment>;
  }

  render() {
    const { title, icon, count, onClick } = this.props;
    return <div className="data-cube-card">
      <div className="inner-container">
        <div className="view-icon-container" onClick={onClick}>
          <SvgIcon className="view-icon" svg={require(`../../../icons/${icon}.svg`)} />
        </div>
        <div className="text">
          <div className="title" onClick={onClick}>{title} {count !== undefined ? <span className="count">{count}</span> : null}</div>
          <div className="description">{this.renderDescription()}</div>
        </div>
      </div>
    </div>;
  }
}
