'use strict';

require.extensions['.css'] = (module: any, filename: string) => {};
require.extensions['.svg'] = (module: any, filename: string) => {
  module.exports = '<svg viewBox="0 0 16 16"><rect width=16 height=16 fill="red"></rect></svg>';
};
