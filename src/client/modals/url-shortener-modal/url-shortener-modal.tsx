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

import axios from "axios";
import React from "react";
import { Fn } from "../../../common/utils/general/general";
import { Modal } from "../../components/modal/modal";
import { SafeCopyToClipboard } from "../../components/safe-copy-to-clipboard/safe-copy-to-clipboard";
import { STRINGS } from "../../config/constants";
import "./url-shortener-modal.scss";

interface UrlShortenerModalProps {
  onClose: Fn;
  title: string;
}

interface UrlProp {
  url: string;
}

export const UrlShortenerModal: React.FunctionComponent<UrlShortenerModalProps & UrlProp> = ({ title, onClose, url }) => {
  return <Modal
    className="short-url-modal"
    title={title}
    onClose={onClose}>
    <UrlShortenerPrompt url={url} />
  </Modal>;
};

interface UrlShortenerPromptState {
  shortUrl: string;
  error?: string;
}

export class UrlShortenerPrompt extends React.Component<UrlProp, UrlShortenerPromptState> {

  state: UrlShortenerPromptState = { shortUrl: null };

  componentDidMount() {
    this.shortenUrl()
      .then(({ shortUrl }) => {
        this.setState({ shortUrl });
      })
      .catch(() => {
        this.setState({ error: "Couldn't create short link" });
      });
  }

  shortenUrl() {
    // NOTE: When replacing axios, please remember that native fetch doesn't reject on 4xx/5xx errors!
    return axios("shorten?url=" + encodeURIComponent(this.props.url))
      .then(response => response.data);
  }

  renderShortUrl() {
    const { shortUrl, error } = this.state;
    if (error) return error;
    if (!shortUrl) return STRINGS.loading;
    return <ShortUrl url={shortUrl} />;
  }

  render() {
    return <React.Fragment>
      <div className="url-shortener">{this.renderShortUrl()}</div>
      <LongUrl url={this.props.url} />
    </React.Fragment>;
  }
}

interface UrlState {
  copied: boolean;
}

export class ShortUrl extends React.Component<UrlProp, UrlState> {

  state = { copied: false };

  copiedUrl = () => this.setState({ copied: true });

  render() {
    const { url } = this.props;
    return <div>
      <div className="url-group">
        <input className="short-url" readOnly={true} value={url} />
        <SafeCopyToClipboard text={url} onCopy={this.copiedUrl}>
          <button className="copy-button">Copy</button>
        </SafeCopyToClipboard>
      </div>
      {this.state.copied && <div className="copied-hint">{STRINGS.copied}</div>}
    </div>;
  }
}

export class LongUrl extends React.Component<UrlProp, UrlState> {

  state = { copied: false };

  copiedUrl = () => this.setState({ copied: true });

  render() {
    return <div className="url-notice">
      Please note that, this url may expire in the future. You still can&nbsp;
      <SafeCopyToClipboard text={this.props.url} onCopy={this.copiedUrl}>
        <span className="copy-action">copy full url</span>
      </SafeCopyToClipboard>
      &nbsp;instead.&nbsp;
      {this.state.copied && <span className="copied-hint">{STRINGS.copied}</span>}
    </div>;
  }
}
