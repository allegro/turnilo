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

import * as Sentry from "@sentry/browser";

export default class ErrorReporter {

  static captureError(error: Error) {
    Sentry.captureException(error);
  }

  static captureMessage(msg: string, level = Sentry.Severity.Log) {
    Sentry.captureMessage(msg, level);
  }

  static init(dsn: string) {
    Sentry.init({ dsn });

    window.onerror = (message, file, line, column, errorObject) => {

      Sentry.captureException(new Error(message.toString()));

      column = column || (window.event && (window.event as any).errorCharacter);
      const stack = errorObject ? errorObject.stack : null;

      const event: Sentry.Event = {
        message: message.toString(),
        extra: {
          file,
          line,
          column,
          stack,
          hash: window.location.hash
        }
      };

      Sentry.captureEvent(event);

      // the error can still be triggered as usual, we just wanted to know what's happening on the client side
      return false;
    };
  }
}
