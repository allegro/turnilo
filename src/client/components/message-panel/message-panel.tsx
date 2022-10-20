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

import React, { ReactNode } from "react";
import { Nullary } from "../../../common/utils/functional/functional";
import { Button } from "../button/button";
import "./message-panel.scss";

interface ErrorViewActionProps {
  action: Nullary<void>;
  label: string;
}

export const MessagePanelAction: React.FunctionComponent<ErrorViewActionProps> = ({ action, label }) =>
    <Button type="primary" onClick={action} title={label} />;

interface ErrorViewProps {
  message?: string | ReactNode;
  title: string;
}

export const MessagePanel: React.FunctionComponent<ErrorViewProps> = ({ message, title, children }) => {
  return <div className="message-panel">
    <div className="message-panel__container">
      <div className="message-panel__title">{title}</div>
      {message && <div className="message-panel__message">{message}</div>}
      {React.Children.count(children) > 0 && <div className="message-panel__children">
        {children}
      </div>}
    </div>
  </div>;
};
