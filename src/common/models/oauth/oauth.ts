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

export interface OauthJS {
  clientId: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  tokenHeaderName: string;
  redirectUri: string;
}

interface OauthDisabled {
  status: "disabled";
}

export interface OauthEnabled {
  status: "enabled";
  clientId: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  tokenHeaderName: string;
  redirectUri: string;
}

export function isEnabled(oauth: Oauth): oauth is OauthEnabled {
  return oauth.status === "enabled";
}

export type Oauth = OauthDisabled | OauthEnabled;

export function fromConfig(config?: OauthJS): Oauth {
  if (!config) return { status: "disabled" };
  return {
    status: "enabled",
    ...config
  };
}

export type SerializedOauth = Oauth;

export function serialize(oauth: Oauth): SerializedOauth {
  return oauth;
}
