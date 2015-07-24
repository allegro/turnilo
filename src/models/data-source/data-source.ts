'use strict';

import { $, Expression, Dispatcher, basicDispatcherFactory, NativeDataset, Dataset } from 'plywood';
import { Dimension } from '../dimension/dimension';
import { Measure } from '../measure/measure';

export class DataSource {

  public title: string;
  public dispatcher: Dispatcher;
  public dimensions: Dimension[];
  public measures: Measure[];

  static fromNativeDataset(title: string, rawData: any[]): DataSource {
    var nativeDataset = <NativeDataset>Dataset.fromJS(rawData);
    nativeDataset.introspect();

    var attributes = nativeDataset.attributes;
    var dimensions: Dimension[] = [];
    var measures: Measure[] = [];

    if (!attributes['count']) {
      measures.push(new Measure('count', 'Count', $('main').count()));
    }

    for (let k in attributes) {
      let type = attributes[k].type;
      switch (type) {
        case 'STRING':
        case 'TIME':
          dimensions.push(new Dimension(k, k, $(k), type));
          break;

        case 'NUMBER':
          measures.push(new Measure(k, k, $('main').sum($(k))));
          break;

        default:
          throw new Error('bad type ' + type);
      }
    }

    dimensions.sort((a, b) => a.title.localeCompare(b.title));
    measures.sort((a, b) => a.title.localeCompare(b.title));

    var dispatcher = basicDispatcherFactory({
      datasets: {
        main: nativeDataset
      }
    });

    return new DataSource(title, dispatcher, dimensions, measures);
  }

  constructor(title: string, dispatcher: Dispatcher, dimensions: Dimension[], measures: Measure[]) {
    this.title = title;
    this.dispatcher = dispatcher;
    this.dimensions = dimensions;
    this.measures = measures;
  }
}

