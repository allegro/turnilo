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

import './view-definition-modal.scss';

import * as React from 'react';
import {Essence, EssenceJS} from '../../../common/models';

import {Fn, makeTitle} from '../../../common/utils';
import {STRINGS} from '../../config/constants';

import {Button, Modal} from '../../components';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/styles/hljs';

import * as CopyToClipboard from 'react-copy-to-clipboard';

export interface ViewDefinitionModalProps {
  onClose: Fn;
  essence: Essence;
}

export interface ViewDefinitionModalState {
  copied: boolean;
}

class MakeUrlData {
  private domain: String;
  private dataCube: String;
  private essence: EssenceJS;

  constructor(domain: String, dataCube: String, essence: EssenceJS) {
    this.domain = domain;
    this.dataCube = dataCube;
    this.essence = essence;
  }

  public printAsJson(): string {
    return JSON.stringify(this, null, 2);
  }
}

export class ViewDefinitionModal extends React.Component<ViewDefinitionModalProps, ViewDefinitionModalState> {

  constructor(props: ViewDefinitionModalProps) {
    super(props);
    this.state = {
      copied: false
    };
  }

  render() {
    const { essence, onClose } = this.props;
    const { copied } = this.state;
    const title = `${makeTitle(STRINGS.viewDefinition)}`;

    const makeUrlData = new MakeUrlData(STRINGS.mkurlDomainPlaceholder, essence.dataCube.name, essence.toJSON());
    const viewDefinitionAsJson = makeUrlData.printAsJson();

    return <Modal
      className="view-definition-modal"
      title={title}
      onClose={onClose}
    >
      <div className="content">
        {STRINGS.viewDefinitionSubtitle}
        <SyntaxHighlighter
          className="definition-view"
          language="json"
          style={githubGist}
        >
          {viewDefinitionAsJson}
        </SyntaxHighlighter>
        <div className="button-bar">
          <Button type="primary" className="close" onClick={onClose} title={STRINGS.close} />

          <CopyToClipboard text={viewDefinitionAsJson} onCopy={() => this.setState({copied: true})}>
            <Button type="secondary" title={STRINGS.copyDefinition} />
          </CopyToClipboard>
          { copied ? <div className="copied-hint">Copied!</div> : null }
        </div>
      </div>
    </Modal>;
  }
}
