import * as Qajax from 'qajax';

export function addErrorMonitor() {
  var originalOnError = window.onerror;
  window.onerror = (message, file, line, column, errorObject) => {
    column = column || (window.event && (window.event as any).errorCharacter);
    var stack = errorObject ? errorObject.stack : null;

    var err = {
      message,
      file,
      line,
      column,
      stack
    };

    if (typeof console !== "undefined") {
      console.log('An error has occurred. Please include the below information in the issue:');
      console.log(JSON.stringify(err));
    }

    Qajax({
      method: "POST",
      url: 'error',
      data: err
    });

    window.onerror = originalOnError; // only trigger once

    // the error can still be triggered as usual, we just wanted to know what's happening on the client side
    return false;
  };
}
