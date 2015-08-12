'use strict';

export function isInside(child: Element, parent: Element): boolean {
  while (child) {
    if (child === parent) return true;
    child = child.parentElement;
  }
  return false;
}

export function dataTransferTypesContain(types: any, neededType: string): boolean {
  if (Array.isArray(types)) {
    return types.indexOf(neededType) !== -1;
  } else if (types instanceof DOMStringList) {
    return types.contains(neededType);
  }
  return false;
}
