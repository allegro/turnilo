export function get(key: string): any {
  try {
    return JSON.parse(localStorage[key]);
  } catch (e) {
    return undefined;
  }
}

export function set(key: string, value: any) {
  try {
    localStorage[key] = JSON.stringify(value);
  } catch (e) {}
}
