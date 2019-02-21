/*
 * Copyright 2015-2016 Imply Data, Inc.
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

export function addErrorMonitor() {
  window.onerror = (message, file, line, column, errorObject) => {
    column = column || (window.event && (window.event as any).errorCharacter);
    const stack = errorObject ? errorObject.stack : null;

    const err = {
      message,
      file,
      line,
      column,
      stack,
      hash: window.location.hash
    };

    if (typeof console !== "undefined") {
      console.log("An error has occurred. Please include the below information in the issue:");
      console.log(JSON.stringify(err));
    }

    const request = new XMLHttpRequest();
    request.open("POST", "error", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(err));

    // the error can still be triggered as usual, we just wanted to know what's happening on the client side
    return false;
  };
}
