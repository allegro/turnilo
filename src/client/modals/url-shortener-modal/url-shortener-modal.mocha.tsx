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

import { expect } from "chai";
import { mount, shallow } from "enzyme";
import React from "react";
import * as sinon from "sinon";
import { SinonStub } from "sinon";
import { Modal } from "../../components/modal/modal";
import { SafeCopyToClipboard } from "../../components/safe-copy-to-clipboard/safe-copy-to-clipboard";
import { STRINGS } from "../../config/constants";
import { LongUrl, ShortUrl, UrlShortenerModal, UrlShortenerPrompt } from "./url-shortener-modal";

const tick = () => Promise.resolve();

describe("<UrlShortenerModal>", () => {
  it("should pass props correctly", () => {
    const onClose = () => {
    };
    const url = "foobar.com";
    const title = "TITLE";

    const modal = shallow(<UrlShortenerModal url={url} title={title} onClose={onClose} />);

    expect(modal.find(UrlShortenerPrompt).prop("url")).to.be.eq(url);
    expect(modal.find(Modal).prop("title")).to.be.eq(title);
    expect(modal.find(Modal).prop("onClose")).to.be.eq(onClose);
  });
});

describe("<UrlShortenerPrompt>", () => {

  let stub: SinonStub;

  const mountPrompt = (fails = false) => {
    stub = sinon.stub(UrlShortenerPrompt.prototype, "shortenUrl");
    if (fails) {
      stub.rejects();
    } else {
      stub.resolves({ shortUrl: "short-url" });
    }
    return mount(<UrlShortenerPrompt url="google.com" />);
  };

  afterEach(() => {
    stub.restore();
  });

  it("renders shortened url", async () => {
    const prompt = mountPrompt();

    const shortener = prompt.find(".url-shortener");
    expect(shortener.text()).to.be.eq(STRINGS.loading);

    await tick();
    prompt.update();
    const updatedShortener = prompt.find(".url-shortener");
    expect(updatedShortener.find(ShortUrl).prop("url")).to.be.eq("short-url");
  });

  it("renders error when url shortener fails", async () => {
    const prompt = mountPrompt(true);

    const shortener = prompt.find(".url-shortener");
    expect(shortener.text()).to.be.eq(STRINGS.loading);

    // wait for "then"
    await tick();
    // wait for "catch"
    await tick();
    prompt.update();
    const updatedShortener = prompt.find(".url-shortener");
    expect(updatedShortener.text()).to.be.eq("Couldn't create short link");
  });
});

describe("<ShortUrl>", () => {
  it("should show copied hint after copying short url", async () => {
    const shortUrl = mount(<ShortUrl url="foobar.com" />);

    shortUrl.find(SafeCopyToClipboard).prop("onCopy")("foo", true);
    await tick();
    shortUrl.update();

    const shortHint = shortUrl.find(".copied-hint");
    expect(shortHint.text()).to.be.eq(STRINGS.copied);
  });
});

describe("<LongUrl>", () => {
  it("should show copied hint after copying long url", async () => {
    const longUrl = mount(<LongUrl url="foobar.com" />);

    longUrl.find(SafeCopyToClipboard).prop("onCopy")("foo", true);
    await tick();
    longUrl.update();

    const longHint = longUrl.find(".copied-hint");
    expect(longHint.text()).to.be.eq(STRINGS.copied);
  });
});
