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

import * as React from "react";
import "./error-view.scss";

interface ErrorViewProps {
  errorId: string | null;
}

const reload = () => window.location.reload();

const recordedErrorMsg = (errorId: string) => `Unexpected error occurred. We recorded it and assigned code: ${errorId}.`;
const defaultErrorMsg = "Unexpected error occurred";

export const ErrorView: React.SFC<ErrorViewProps> = ({ errorId }) => {
  const message = errorId !== null ? recordedErrorMsg(errorId) : defaultErrorMsg;
  return <div className="error-view">
    <div className="error-view__container">
      <div className="error-view__title">General error</div>
      <div className="error-view__message">{message}</div>
      <div className="error-view__reload" onClick={reload}>Reload view</div>
    </div>
  </div>;
};
