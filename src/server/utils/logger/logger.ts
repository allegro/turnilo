export interface Logger {
  log: (line: string) => void;
  warn: (line: string) => void;
  error: (line: string) => void;
}

export const CONSOLE_LOGGER: Logger = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};

function noop() {}

export const NULL_LOGGER: Logger = {
  log: noop,
  warn: noop,
  error: noop
};
