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
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/styles/hljs";
import { Fn } from "../../../common/utils/general/general";
import { Button } from "../../components/button/button";
import { Modal } from "../../components/modal/modal";
import { SafeCopyToClipboard } from "../../components/safe-copy-to-clipboard/safe-copy-to-clipboard";
import { STRINGS } from "../../config/constants";
import { classNames, JSXNode } from "../../utils/dom/dom";
import "./source-modal.scss";

interface SourceModalProps {
  onClose: Fn;
  title: string;
  header?: JSXNode;
  className?: string;
  copyLabel?: string;
  source: string;
}

interface SourceModalState {
  copied: boolean;
}

export class SourceModal extends React.Component<SourceModalProps, SourceModalState> {

  state: SourceModalState = { copied: false };

  onCopy = () => this.setState({ copied: true });

  render() {
    const { copyLabel = STRINGS.copyDefinition, onClose, source, title, className, header } = this.props;

    return <Modal
      onClose={onClose}
      title={title}
      className={classNames("source-modal", className)}
    >
      <div className="content">
        {header}
        <SyntaxHighlighter className="source-modal__source" language="json" style={githubGist}>
          {source}
        </SyntaxHighlighter>
        <div className="button-bar">
          <Button type="primary" className="close" onClick={onClose} title={STRINGS.close} />
          <SafeCopyToClipboard text={source} onCopy={this.onCopy}>
            <Button type="secondary" title={copyLabel} />
          </SafeCopyToClipboard>
          {this.state.copied && <div className="copied-hint">{STRINGS.copied}</div>}
        </div>
      </div>
    </Modal>;
  }
}
