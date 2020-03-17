/*
 * Copyright 2017-2019 Allegro.pl
 * Copyright 2020 Remerge GmbH
 */
import { clientConfig } from "./client-config";
import { parseIdToken, removeIdToken } from "./id-token";

function encodedLocation(): string {
  return encodeURIComponent(window.location.href);
}

export function init() {
  const { mixpanelToken, loginUrl } = clientConfig();

  if (mixpanelToken) {
    const idToken = parseIdToken();

    if (!idToken) {
      removeIdToken();
      window.location.href = `${loginUrl}?redirectTo=${encodedLocation()}`;
    }
  }
}
