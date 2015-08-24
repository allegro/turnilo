'use strict';

import * as d3 from 'd3';

export function isInside(child: Element, parent: Element): boolean {
  while (child) {
    if (child === parent) return true;
    child = child.parentElement;
  }
  return false;
}

export function findParentWithClass(child: Element, className: string): Element {
  while (child) {
    if (child.classList.contains(className)) return child;
    child = <Element>child.parentNode;
  }
  return null;
}

export function dataTransferTypesContain(types: any, neededType: string): boolean {
  if (Array.isArray(types)) {
    return types.indexOf(neededType) !== -1;
  } else if (types instanceof DOMStringList) {
    return types.contains(neededType);
  }
  return false;
}

export function setDragGhost(dataTransfer: DataTransfer, text: string): void {
  // Thanks to http://www.kryogenix.org/code/browser/custom-drag-image.html
  var dragGhost = d3.select(document.body).append('div')
    .attr('class', 'drag-ghost')
    .text(text);

  // remove <any> when DataTransfer interface in lib.d.ts includes setDragImage
  (<any>dataTransfer).setDragImage(dragGhost.node(), -20, -20);

  // Remove the host after a ms because it is no longer needed
  setTimeout(() => {
    dragGhost.remove();
  }, 1);
}

export function escapeKey(e: KeyboardEvent): boolean {
  return e.which === 27; // 27 is the code for escape
}
