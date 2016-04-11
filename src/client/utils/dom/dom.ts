import * as d3 from 'd3';
import { hasOwnProperty } from '../../../common/utils/general/general';

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
  var altParent: Element;
  while (child) {
    if (child === parent) return true;

    var dataset = (child as HTMLElement).dataset;
    if (dataset && dataset['parent'] && (altParent = document.getElementById(dataset['parent']))) {
      child = altParent;
    } else {
      child = child.parentElement;
    }
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

export function enterKey(e: KeyboardEvent): boolean {
  return e.which === 13; // 13 is the code for enter
}

export function escapeKey(e: KeyboardEvent): boolean {
  return e.which === 27; // 27 is the code for escape
}

var lastID = 0;
export function uniqueId(prefix: string): string {
  lastID++;
  return prefix + lastID;
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

export function getXFromEvent(e: MouseEvent | DragEvent): number {
  return e.clientX || e.pageX;
}

export function getYFromEvent(e: MouseEvent | DragEvent): number {
  return e.clientY || e.pageY;
}

export function roundToPx(n: number): number {
  return Math.round(n);
}

export function roundToHalfPx(n: number): number {
  return Math.round(n - 0.5) + 0.5;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function classNames(...args: Array<string | Lookup<any>>): string {
  var classes: string[] = [];

  for (var arg of args) {
    if (!arg) continue;

    var argType = typeof arg;

    if (argType === 'string') {
      classes.push(arg as string);
    } else if (argType === 'object') {
      for (var key in (arg as Lookup<any>)) {
        if (hasOwnProperty(arg, key) && (arg as any)[key]) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}
