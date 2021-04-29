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

import axios, { AxiosError } from "axios";
import { encode as base64encode } from "base64-arraybuffer";
import { stringify } from "querystring";
import { generate } from "randomstring";
import { isEnabled, Oauth, OauthEnabled } from "../../common/models/oauth/oauth";
import { get, remove, set } from "../utils/local-storage/local-storage";

const TOKEN_KEY = "turnilo-oauth-access-token";
const URL_KEY = "turnilo-oauth-redirect-url";
const VERIFIER_KEY = "turnilo-oauth-code-verifier";

export const getToken = (): string | undefined => get(TOKEN_KEY);
export const resetToken = () => remove(TOKEN_KEY);
const saveToken = (token: string) => set(TOKEN_KEY, token);

const getUrl = (): string | undefined => get(URL_KEY);
const resetUrl = () => remove(URL_KEY);
const saveUrl = (url: string) => set(URL_KEY, url);

const getVerifier = (): string | undefined => get(VERIFIER_KEY);
const resetVerifier = () => remove(VERIFIER_KEY);
const saveVerifier = (codeVerifier: string) => set(VERIFIER_KEY, codeVerifier);

export const getCode = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

export const hasCode = () => getCode() !== null;

export class OauthError extends Error {
  isOauthError = true;
}

class OauthAuthenticationError extends OauthError {
}

class OauthAuthorizationError extends OauthError {
}

export const isOauthError = (error: Error): error is OauthError =>
  error.hasOwnProperty("isOauthError");

export function mapOauthError(oauth: Oauth, error: AxiosError): Error {
  if (isEnabled(oauth) && !!error.response) {
    const { response: { status } } = error;
    if (status === 401) return new OauthAuthenticationError(error.message);
    if (status === 403) return new OauthAuthorizationError(error.message);
  }
  return error;
}

export function exchangeCodeForToken(code: string, oauth: OauthEnabled) {
  const codeVerifier = getVerifier();
  return axios.post(oauth.tokenEndpoint, stringify({
    client_id: oauth.clientId,
    code,
    redirect_uri: oauth.redirectUri,
    grant_type: "authorization_code",
    code_verifier: codeVerifier
  }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then(response => {
    resetVerifier();
    saveToken(String(response.data["access_token"]));
  });
}

export function redirectToSavedUrl() {
  const url = getUrl();
  resetUrl();
  window.location.href = url;
}

function generateCodeChallenge(codeVerifier: string): PromiseLike<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  return window.crypto.subtle.digest("SHA-256", data).then(digest => {
    const base64Digest = base64encode(digest);
    return base64Digest
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  });
}

function getCodeChallenge(): PromiseLike<string> {
  const codeVerifier = generate(128);
  saveVerifier(codeVerifier);
  return generateCodeChallenge(codeVerifier);
}

export function login(oauth: OauthEnabled) {
  function redirectToAuthorization(codeChallenge: string) {
    saveUrl(window.location.href);
    const queryParams = `?client_id=${oauth.clientId}&redirect_uri=${encodeURIComponent(oauth.redirectUri)}&response_type=code&code_challenge_method=S256&code_challenge=${codeChallenge}`;
    window.location.href = `${oauth.authorizationEndpoint}${queryParams}`;
  }

  getCodeChallenge().then(redirectToAuthorization);
}
