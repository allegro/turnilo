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
import { MessagePanel, MessagePanelAction } from "../../components/message-panel/message-panel";

const reload = () => window.location.reload();

const recordedErrorMsg = (errorId: string) => `Unexpected error occurred. We recorded it and assigned code: ${errorId}.`;
const defaultErrorMsg = "Unexpected error occurred";

interface GeneralErrorProps {
  errorId: string | null;
}

export const GeneralError: React.FunctionComponent<GeneralErrorProps> = ({ errorId }) => {
  const message = errorId !== null ? recordedErrorMsg(errorId) : defaultErrorMsg;
  return <MessagePanel message={message} title="General error">
    <MessagePanelAction action={reload} label="Reload View" />
  </MessagePanel>;
};
