function getStack(): any[] {
  let ErrorConstructor = <any>Error;

  var origPrepareStackTrace = ErrorConstructor.prepareStackTrace;

  ErrorConstructor.prepareStackTrace = (_: any, stack: any) => stack;

  var err = new Error() as any;
  var stack = err['stack'] as any[];
  ErrorConstructor.prepareStackTrace = origPrepareStackTrace;
  stack.shift(); // getStack --> Error

  return stack;
}

export function getCallerFile() {
  var stack = getStack();

  stack.shift(); // getCaller --> getStack
  stack.shift(); // caller of getCaller --> getCaller

  return stack[0].getFileName();
}
