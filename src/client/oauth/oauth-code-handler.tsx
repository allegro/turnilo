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

import React from "react";
import { OauthEnabled } from "../../common/models/oauth/oauth";
import { Loader } from "../components/loader/loader";
import { MessagePanel, MessagePanelAction } from "../components/message-panel/message-panel";
import { exchangeCodeForToken, redirectToSavedUrl } from "./oauth";

interface OauthCodeHandlerProps {
  oauth: OauthEnabled;
  code: string;
}

enum RequestStatus { PENDING, ERROR }

interface FailedRequest {
  status: RequestStatus.ERROR;
  error: Error;
}

interface PendingRequest {
  status: RequestStatus.PENDING;
}

type Request = PendingRequest | FailedRequest;

const pending: Request = { status: RequestStatus.PENDING };
const error = (e: Error): Request => ({ status: RequestStatus.ERROR, error: e });

interface OauthCodeHandlerState {
  request: Request;
}

export class OauthCodeHandler extends React.Component<OauthCodeHandlerProps, OauthCodeHandlerState> {

  state: OauthCodeHandlerState = { request: pending };

  private authorize = () => {
    const { code, oauth } = this.props;
    this.setState({ request: pending });
    exchangeCodeForToken(code, oauth)
      .then(redirectToSavedUrl)
      .catch(err => {
        this.setState({ request: error(err) });
      });
  }

  componentDidMount() {
    this.authorize();
  }

  render() {
    const { request } = this.state;
    switch (request.status) {
      case RequestStatus.PENDING:
        return <MessagePanel title="Requesting token...">
          <Loader/>
        </MessagePanel>;
      case RequestStatus.ERROR:
        return <MessagePanel
          title="Authorization error"
          message={request.error.message}>
          <MessagePanelAction action={this.authorize} label="Retry"/>
        </MessagePanel>;
    }
  }
}
