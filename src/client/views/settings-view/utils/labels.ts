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

export const CLUSTER_EDIT = {
  host: {
    error: 'An IP address must be compliant with the IPv4 standard. It should look like this: 127.0.0.1',
    help: 'The IP address of this cluster\'s host'
  },
  timeout: {
    error: 'The timeout can only contain numbers. It should look like this: 30000',
    help: 'The cluster\'s timeout (!)'
  },
  sourceListRefreshInterval: {
    error: 'The refresh interval can only contain numbers. It should look like this: 15000',
    help: 'The cluster\'s refresh interval is the delay between two updates'
  }
};


export const GENERAL = {
  title: {
    error: 'The title should not be empty',
    help: 'What will appear as the tab\'s title in your browser. Use \'%v\' as a placeholder for Pivot\'s version.'
  }
};

export const CUBE_EDIT = {
  title: {
    error: 'The title should not be empty',
    help: 'What will appear as the tab\'s title in your browser. Use \'%v\' as a placeholder for Pivot\'s version.'
  },
  description: {
    error: '',
    help: 'The cube\'s description'
  },
  clusterName: {
    error: 'The cluster name should not be empty',
    help: 'The cube\'s cluster, really.'
  },
  source: {
    error: 'The source should not be empty',
    help: 'The cube\'s source ?'
  }
};
