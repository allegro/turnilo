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

import { External } from "plywood";
import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/styles/hljs";
import { Essence } from "../../../common/models/essence/essence";
import { Timekeeper } from "../../../common/models/timekeeper/timekeeper";
import { Fn } from "../../../common/utils/general/general";
import makeQuery from "../../../common/utils/query/visualization-query";
import { Button } from "../../components/button/button";
import { Modal } from "../../components/modal/modal";
import { STRINGS } from "../../config/constants";
import "./druid-query-modal.scss";

interface DruidQueryModalProps {
  onClose: Fn;
  essence: Essence;
  timekeeper: Timekeeper;
}

interface DruidQueryModalState {
  copied: boolean;
}

export class DruidQueryModal extends React.Component<DruidQueryModalProps, DruidQueryModalState> {

  state: DruidQueryModalState = { copied: false };

  onCopy = () => this.setState({ copied: true });

  render() {
    const { onClose, timekeeper, essence } = this.props;
    const { dataCube: { attributes, source } } = essence;
    const query = makeQuery(essence, timekeeper);
    const external = External.fromJS({ engine: "druid", attributes, source });
    const plan = query.simulateQueryPlan({ main: external });
    const planString = JSON.stringify(plan, null, 2);

    return <Modal
      onClose={onClose}
      title="Druid query"
      className="druid-query-modal"
    >
      <div className="content">
        <SyntaxHighlighter
          className="druid-query"
          language="json"
          style={githubGist}
        >
          {planString}
        </SyntaxHighlighter>
        <div className="button-bar">
          <Button type="primary" className="close" onClick={onClose} title={STRINGS.close} />
          <CopyToClipboard text={planString} onCopy={this.onCopy}>
            <Button type="secondary" title={STRINGS.copyDefinition} />
          </CopyToClipboard>
          {this.state.copied ? <div className="copied-hint">Copied!</div> : null}
        </div>
      </div>
    </Modal>;
  }
}
