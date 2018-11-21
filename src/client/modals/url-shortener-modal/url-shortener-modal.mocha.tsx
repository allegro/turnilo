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

import { expect } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as CopyToClipboard from "react-copy-to-clipboard";
import { FailUrlShortener, SuccessUrlShortener } from "../../../common/models/url-shortener/url-shortener.fixtures";
import { STRINGS } from "../../config/constants";
import { UrlShortenerPrompt } from "./url-shortener-modal";

const tick = () => Promise.resolve();

const mountPrompt = (failed = false) =>
  mount(<UrlShortenerPrompt
    url="google.com"
    shortener={failed ? FailUrlShortener : SuccessUrlShortener}
  />);

describe("<UrlShortenerPrompt>", () => {
  it("renders shortened url", async () => {
    const prompt = mountPrompt();

    const shortener = prompt.find(".url-shortener");
    expect(shortener.text()).to.be.eq(STRINGS.loading);

    await tick();
    prompt.update();
    const updatedShortener = prompt.find(".url-shortener");
    expect(updatedShortener.find(".short-url").prop("value")).to.be.eq("http://foobar");
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

  it("should show copied hint after copying short url", async () => {
    const prompt = mountPrompt();

    await tick();
    prompt.update();
    const shortener = prompt.find(".url-shortener");
    shortener.find(CopyToClipboard).prop("onCopy")("foo", true);
    await tick();
    prompt.update();

    const clickedShortener = prompt.find(".url-shortener");
    const shortHint = clickedShortener.find(".copied-hint");
    expect(shortHint.text()).to.be.eq(STRINGS.copied);

    const notice = prompt.find(".url-notice");
    const longHint = notice.find(".copied-hint");
    expect(longHint).to.have.length(0);
  });

  it("should show copied hint after copying long url", async () => {
    const prompt = mountPrompt();

    (prompt.instance() as UrlShortenerPrompt).copiedLongUrl();
    const notice = prompt.find(".url-notice");
    notice.find(CopyToClipboard).prop("onCopy")("foo", true);
    await tick();
    prompt.update();

    const clickedNotice = prompt.find(".url-notice");
    const longHint = clickedNotice.find(".copied-hint");
    expect(longHint.text()).to.be.eq(STRINGS.copied);

    const shortener = prompt.find(".url-shortener");
    const shortHint = shortener.find(".copied-hint");
    expect(shortHint).to.have.length(0);
  });
});
