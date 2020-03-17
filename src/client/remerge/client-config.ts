
/*
 * Copyright 2017-2019 Allegro.pl
 * Copyright 2020 Remerge GmbH
 */
import { RemergeClientConfig } from "../../common/remerge/client-config";

export function clientConfig(): RemergeClientConfig {
  return (window as any)["__REMERGE_CONFIG__"] as RemergeClientConfig;
}
