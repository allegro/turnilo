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

import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { UrlShortener } from "../../../common/models/url-shortener/url-shortener";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { Modal } from "../modal/modal";
import "./short-url-modal.scss";

interface CopyShortUrlProps {
  url: string;
  title: string;
  shortener: UrlShortener;
  onClose: Fn;
}

interface CopyShortUrlState {
  copiedShortUrl: boolean;
  copiedLongUrl: boolean;
  shortUrl: string;
  error?: string;
}

export class ShortUrlModal extends React.Component<CopyShortUrlProps, CopyShortUrlState> {

  state: CopyShortUrlState = { copiedLongUrl: false, copiedShortUrl: false, shortUrl: null };

  componentDidMount() {
    if (this.props.shortener) this.shortenUrl();
  }

  copiedShortUrl = () => this.setState({ copiedShortUrl: true });

  copiedLongUrl = () => this.setState({ copiedLongUrl: true });

  shortenUrl() {
    const { shortener, url } = this.props;
    shortener
      .shortenUrl(url)
      .then(shortUrl => {
        this.setState({ shortUrl });
      })
      .catch(() => {
        this.setState({ error: "Couldn't create short link" });
      });
  }

  renderShortUrl() {
    const { shortUrl, copiedShortUrl, error } = this.state;
    if (error) return error;
    if (!shortUrl) return STRINGS.loading;

    return <div className="short-url-container">
      <div className="url-group">
        <input className="short-url" readOnly={true} value={shortUrl} />
        <CopyToClipboard text={shortUrl} onCopy={this.copiedShortUrl}>
          <button className="copy-button">Copy</button>
        </CopyToClipboard>
      </div>
      {copiedShortUrl && <div className="copied-hint">{STRINGS.copied}</div>}
    </div>;
  }

  render() {
    const { title, onClose, url } = this.props;
    const { copiedLongUrl } = this.state;

    return <Modal
      className="short-url-modal"
      title={title}
      onClose={onClose}>
      {this.renderShortUrl()}
      <div className="url-notice">
        Please note that, this url may expire in the future. You still can&nbsp;
        <CopyToClipboard text={url} onCopy={this.copiedLongUrl}>
          <span className="copy-action">copy full url</span>
        </CopyToClipboard>
        &nbsp;instead.&nbsp;
        {copiedLongUrl && <span className="copied-hint">{STRINGS.copied}</span>}
      </div>
    </Modal>;
  }
}
