'use strict';

import { $, helper } from 'plywood';
import { druidRequesterFactory } from 'plywood-druid-requester';

export interface ProperDruidRequesterOptions {
  druidHost?: string;
  retry?: number;
  timeout?: number;
  verbose?: boolean;
  concurrentLimit?: number;
}

export function properDruidRequesterFactory(options: ProperDruidRequesterOptions): Requester.PlywoodRequester<any> {
  var {
    druidHost,
    retry,
    timeout,
    verbose,
    concurrentLimit
  } = options;

  var druidRequester = druidRequesterFactory({
    host: druidHost,
    timeout: timeout || 30000
  });

  if (retry) {
    druidRequester = helper.retryRequesterFactory({
      requester: druidRequester,
      retry: retry,
      delay: 500,
      retryOnTimeout: false
    });
  }

  if (verbose) {
    druidRequester = helper.verboseRequesterFactory({
      requester: druidRequester
    });
  }

  if (concurrentLimit) {
    druidRequester = helper.concurrentLimitRequesterFactory({
      requester: druidRequester,
      concurrentLimit: concurrentLimit
    });
  }

  return druidRequester;
}
