/*
 * Copyright 2015-2016 Imply Data, Inc.
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

import * as Q from 'q';
import * as request from "request";

import { User } from '../../../common/models/index';
import { LOGGER } from '../logger/logger';

export interface TrackOptions {
  eventType: string;
  user?: User;
  attr?: Lookup<string>;
  metric: string;
  value: number;
}

export interface Tracker {
  track: (options: TrackOptions) => void;
}

interface Flush {
  (events: any[]): Q.Promise<any>;
}

interface TrackerFactoryOptions {
  bufferSize?: number;
  flushInterval?: number;
  timestamp?: () => Date;
  context?: Lookup<string>;
  url?: string;
  flush?: Flush;
  version?: string;
}

function makePostFlush(url: string, timeout = 30000): Flush {
  return function (events: any[]): Q.Promise<any> {
    var deferred = <Q.Deferred<any>>(Q.defer());

    request({
      method: "POST",
      url: url,
      json: events,
      timeout: timeout
    }, (err, response, body) => {
      if (err) {
        deferred.reject(err);
        return;
      }

      var statusCode = response.statusCode;
      if (statusCode < 200 || statusCode >= 300) {
        deferred.reject(new Error(`Bad status code (${statusCode})`));
        return;
      }

      deferred.resolve(null);
    });

    return deferred.promise;
  };
}

function trackerFactory(trackerFactoryOptions: TrackerFactoryOptions): Tracker {
  var bufferSize = trackerFactoryOptions.bufferSize || 1024;
  var flushInterval = trackerFactoryOptions.flushInterval || 10000;
  var timestamp = trackerFactoryOptions.timestamp || (() => new Date());
  var context = trackerFactoryOptions.context;
  var flush = trackerFactoryOptions.flush;
  var version = trackerFactoryOptions.version;
  if (!flush && trackerFactoryOptions.url) {
    flush = makePostFlush(trackerFactoryOptions.url);
  }

  var buffer: any[] = [];

  var flushing = false;
  function doFlush(): void {
    if (flushing || buffer.length === 0) return;
    flushing = true;

    var eventsToFlush = buffer.slice();
    //console.log('posting', eventsToFlush);
    flush(eventsToFlush).then(
      () => {
        LOGGER.log(`Posted ${eventsToFlush.length} tracking events`);
        buffer = buffer.slice(eventsToFlush.length);
        flushing = false;
      },
      (e: Error) => {
        LOGGER.error(`Failed to post ${eventsToFlush.length} tracking events: ${e.message}`);
        // Maybe add a flush failed event.
        flushing = false;
      }
    );
  }

  setInterval(doFlush, flushInterval).unref();

  return {
    track: (options: TrackOptions) => {
      if (buffer.length > bufferSize) return;

      const {
        eventType,
        user,
        attr,
        metric,
        value
      } = options;

      var event: any = {};

      if (context) {
        for (var k in context) event[k] = context[k];
      }

      if (attr) {
        for (var k in attr) event[k] = attr[k];
      }

      if (user) {
        event['user_id'] = user.id;
      }

      event['timestamp'] = timestamp();
      event['version'] = version;
      event['type'] = eventType;
      event['metric'] = metric;
      event['value'] = value;

      buffer.push(event);
    }
  };
}

function noop() {}

export const TRACKER: Tracker = {
  track: noop
};

export function initTracker(version: string, url: string, context: Lookup<any>): void {
  var tempTracker = trackerFactory({
    version,
    url,
    context
  });

  TRACKER.track = tempTracker.track;
}
