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

import React from "react";
import { classNames } from "../../utils/dom/dom";
import "./message.scss";

type MessageLevel = "error" | "notice";

interface ErrorProps {
  content: string;
  title?: string;
  level?: MessageLevel;
}

export const Message: React.FunctionComponent<ErrorProps> = props => {
  const { content, title, level = "notice" } = props;
  return <div className={classNames("message", level)}>
    <div className="whiteout" />
    <div className="message-container">
      <div className="message-title">{title}</div>
      <div className="message-content">{content}</div>
    </div>
  </div>;
};
