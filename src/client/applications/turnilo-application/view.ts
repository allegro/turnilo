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

import { OauthError } from "../../oauth/oauth";

type ViewType = "home" | "cube" | "general-error" | "oauth-code-handler" | "oauth-message";

interface ViewBase {
  viewType: ViewType;
}

interface Home extends ViewBase {
  viewType: "home";
}

interface Cube extends ViewBase {
  viewType: "cube";
  cubeName: string;
  hash: string;
}

interface GeneralError extends ViewBase {
  viewType: "general-error";
  errorId?: string;
}

interface OauthCodeHandler extends ViewBase {
  viewType: "oauth-code-handler";
  code: string;
}

interface OauthMessage extends ViewBase {
  viewType: "oauth-message";
  error: OauthError;
}

export type View = Home | Cube | GeneralError | OauthCodeHandler | OauthMessage;

export const home: Home = {
  viewType: "home"
};

export const cube = (cubeName: string, hash: string): Cube => ({
  viewType: "cube",
  hash,
  cubeName
});

export const generalError = (errorId?: string): GeneralError => ({
  viewType: "general-error",
  errorId
});

export const oauthCodeHandler = (code: string): OauthCodeHandler => ({
  viewType: "oauth-code-handler",
  code
});

export const oauthMessageView = (error: OauthError): OauthMessage => ({
  viewType: "oauth-message",
  error
});

export const navigateToHome = () => window.location.href = "#";
