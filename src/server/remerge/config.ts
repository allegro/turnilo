/*
 * Copyright 2017-2019 Allegro.pl
 * Copyright 2020 Remerge GmbH
 */
import { config } from "dotenv";
import { RemergeClientConfig } from "../../common/remerge/client-config";

config();

const remergeConfig: RemergeClientConfig = {
  loginUrl: process.env.LOGIN_URL,
  mixpanelToken: process.env.MIXPANEL_TOKEN
};

export function remergeClientConfig(): RemergeClientConfig {
  return {
    loginUrl: remergeConfig.loginUrl,
    mixpanelToken: remergeConfig.mixpanelToken
  };
}

export default remergeConfig;
