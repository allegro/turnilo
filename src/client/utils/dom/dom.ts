'use strict';

import * as d3 from 'd3';

const DRAG_GHOST_OFFSET_X = -12;
const DRAG_GHOST_OFFSET_Y = -12;

function convertDOMStringListToArray(list: any): any[] {
  var length = list.length;
  var array: any[] = [];
  for (var i = 0; i < length; i++) {
    array.push(list.item(i));
  }
  return array;
}


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

export function dataTransferTypesGet(types: any, typePrefix: string): string {
  if (types instanceof DOMStringList) types = convertDOMStringListToArray(types);
  for (var type of types) {
    if (type.indexOf(typePrefix) === 0) {
      return type.substr(typePrefix.length + 1);
    }
  }
  return null;
}

export function setDragGhost(dataTransfer: DataTransfer, text: string): void {
  // Thanks to http://www.kryogenix.org/code/browser/custom-drag-image.html
  var dragGhost = d3.select(document.body).append('div')
    .attr('class', 'drag-ghost')
    .text(text);

  // remove <any> when DataTransfer interface in lib.d.ts includes setDragImage
  (<any>dataTransfer).setDragImage(dragGhost.node(), DRAG_GHOST_OFFSET_X, DRAG_GHOST_OFFSET_Y);

  // Remove the host after a ms because it is no longer needed
  setTimeout(() => {
    dragGhost.remove();
  }, 1);
}

export function escapeKey(e: KeyboardEvent): boolean {
  return e.which === 27; // 27 is the code for escape
}

export function transformStyle(x: number, y: number): any {
  var xStr = String(x);
  var yStr = String(y);
  if (xStr !== '0') xStr += 'px';
  if (yStr !== '0') yStr += 'px';
  var transform = `translate(${xStr},${yStr})`;
  return {
    transform,
    WebkitTransform: transform,
    MsTransform: transform
  };
}
