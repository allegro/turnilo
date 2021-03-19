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

import { BaseImmutable, Property } from "immutable-class";

interface OauthValue {
  clientId: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  tokenHeaderName: string;
  redirectUri: string;
}

export interface OauthJS {
  clientId: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  tokenHeaderName: string;
  redirectUri: string;
}

export class Oauth extends BaseImmutable<OauthValue, OauthJS> {

  static PROPERTIES: Property[] = [
    { name: "clientId" },
    { name: "tokenEndpoint" },
    { name: "authorizationEndpoint" },
    { name: "tokenHeaderName" },
    { name: "redirectUri" }
  ];

  static fromJS(params: OauthJS): Oauth {
    return new Oauth(BaseImmutable.jsToValue(Oauth.PROPERTIES, params));
  }

  public clientId: string;
  public tokenEndpoint: string;
  public authorizationEndpoint: string;
  public tokenHeaderName: string;
  public redirectUri: string;
}
