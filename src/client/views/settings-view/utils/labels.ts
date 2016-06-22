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
  engine: {
    error: 'The engine should not be empty',
    help: 'The cube\'s cluster, really.'
  },
  source: {
    error: 'The source should not be empty',
    help: 'The cube\'s source ?'
  }
};
