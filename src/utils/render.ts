'use strict';

import * as d3 from 'd3';
import Selection = d3.Selection;
import { $, Expression, Dataset, Datum } from 'plywood';


interface TagAndClasses {
  tag: string;
  classes: string[];
}

function parseSelector(selector: string): TagAndClasses {
  var classes = selector.split('.');
  var tag = classes.shift();
  if (tag === '') throw new Error('Empty tag');
  return {
    tag,
    classes
  };
}


export interface BindParameters {
  selector: string;
  split?: (d: Datum) => Datum[];
  splitAs?: string;
  join?: (d: Datum) => string;
  apply?: Lookup<(d: Datum) => any>;
  onEnter?: (s: Selection<Datum>) => void;
  onExit?: (s: Selection<Datum>) => void;
}

export function bindOne(selection: Selection<Datum>, arg: BindParameters): Selection<Datum> {
  var selector = arg.selector;
  if (arg.onExit) {
    throw new Error("selectOrAppend is not meant to use onExit. Try updating datum with compute");
  }

  var apply = arg.apply;
  if (apply) {
    var datumFn = (d: Datum, i: number): Datum[] => {
      var nd = Object.create(d);
      for (var name in apply) {
        var fn = apply[name];
        var fnv = fn.call(this, nd, i);
        if (typeof fnv !== 'undefined') nd[name] = fnv;
      }
      return nd;
    };
  }

  var empties = selection.filter(() => d3.select(this).select(selector).empty());
  if (!empties.empty()) {
    var tagAndClasses = parseSelector(selector);
    var enterSelection = empties.append(tagAndClasses.tag);
    var classes = tagAndClasses.classes;
    if (classes.length) enterSelection.attr('class', classes.join(' '));
    if (arg.onEnter) {
      if (datumFn) enterSelection.datum(datumFn);
      arg.onEnter.call(enterSelection, enterSelection);
    }
  }

  var updateSelection = selection.select(selector);
  if (datumFn) updateSelection.datum(datumFn);

  return updateSelection;
}


export function bindMany(selection: Selection<Datum>, arg: BindParameters): Selection<Datum> {
  var selector = arg.selector;
  var split = arg.split;
  var splitAs = arg.splitAs;
  if (!split || !splitAs) throw new TypeError("`split` and `splitAs` must be defined");
  var apply = arg.apply || {};

  var tagAndClasses = parseSelector(selector);
  var classes = tagAndClasses.classes;

  function dataFn(d: Datum, i: number) {
    var vs = split.call(this, d, i);
    if (!Array.isArray(vs)) throw new TypeError("`data` must return an array");
    return vs.map((v: Datum, index: number) => {
      var nd = Object.create(d);
      nd.index = index;
      nd[splitAs] = v;
      for (var name in apply) {
        var fn = apply[name];
        var fnv = fn.call(this, nd, i);
        if (typeof fnv !== 'undefined') nd[name] = fnv;
      }
      return nd;
    });
  }

  var update = selection.selectAll(selector).data(dataFn, arg.join);

  var enterSelection = update.enter().append(tagAndClasses.tag);
  if (classes.length) enterSelection.attr('class', classes.join(' '));

  var onEnter = arg.onEnter;
  if (onEnter) onEnter.call(enterSelection, enterSelection);

  var onExit = arg.onExit;
  var exitSelection = update.exit();
  if (onExit) {
    onExit.call(exitSelection, exitSelection);
  } else {
    exitSelection.remove();
  }

  return update;
}
