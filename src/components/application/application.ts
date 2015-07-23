'use strict';

import React = require('react');
import { $, Expression, Datum, Dataset, NativeDataset, TimeRange, Dispatcher } from 'plywood';
import { Filter, Dimension, Measure, SplitCombine, Clicker } from "../../models/index";

import { HeaderBar } from '../header-bar/header-bar';
import { TimeSeriesVis } from '../time-series-vis/time-series-vis';
import { NestedTableVis } from '../nested-table-vis/nested-table-vis';
import { FilterSplitPanel } from '../filter-split-panel/filter-split-panel';
import { VisBar } from '../vis-bar/vis-bar';


interface ApplicationProps {
  dispatcher: Dispatcher;
  dimensions: Dimension[];
  measures: Measure[];
}

interface ApplicationState {
  filter?: Filter;
  splits?: SplitCombine[];
  dragOver?: boolean;
}

export class Application extends React.Component<ApplicationProps, ApplicationState> {
  private clicker: Clicker;
  private dragCounter: number;

  constructor() {
    super();
    this.state = {
      filter: new Filter([
        $('time').in(TimeRange.fromJS({
          start: new Date('2013-02-26T00:00:00Z'),
          end: new Date('2013-02-27T00:00:00Z')
        }))
      ])
    };

    var self = this;
    this.clicker = {
      setFilter: (filter: Filter) => {
        self.setState({ filter });
      },
      changeSplits: (splits: SplitCombine[]) => {

      },
      addSplit: (split: SplitCombine) => {

      }
    };
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  dragOver(e: DragEvent) {
    e.preventDefault();
  }

  dragEnter(e: DragEvent) {
    var { dragOver } = this.state;
    if (!dragOver) {
      this.dragCounter = 0;
      this.setState({
        dragOver: true
      });
    } else {
      this.dragCounter++;
    }
  }

  dragLeave(e: DragEvent) {
    var { dragOver } = this.state;
    if (!dragOver) return;
    if (this.dragCounter === 0) {
      this.setState({
        dragOver: false
      });
    } else {
      this.dragCounter--;
    }
  }

  drop(e: DragEvent) {
    this.dragCounter = 0;
    this.setState({
      dragOver: false
    });
    console.log('drop into vis');
  }

  render() {
    var clicker = this.clicker;
    var { dispatcher, dimensions, measures } = this.props;
    var { filter, splits, dragOver } = this.state;

    // <TimeSeriesVis dispatcher={basicDispatcher} filter={filter} measures={measures}/>

    var visualization = JSX(`
      <NestedTableVis dispatcher={dispatcher} filter={filter} measures={measures}/>
    `);

    var dropIndicator: React.DOMElement<any> = null;
    if (dragOver) {
      dropIndicator = JSX(`
        <div className="drop-indicator">
          <div className="white-out"></div>
          <div className="actions">
            <div className="replace-split action">Full view</div>
            <div className="add-split action">Add split</div>
          </div>
        </div>
      `);
    }

    return JSX(`
      <main className='explorer'>
        <HeaderBar/>
        <div className='container'>
          <FilterSplitPanel clicker={clicker} dispatcher={dispatcher} filter={filter} splits={splits} dimensions={dimensions}/>
          <div
            className='vis-pane'
            onDragOver={this.dragOver.bind(this)}
            onDragEnter={this.dragEnter.bind(this)}
            onDragLeave={this.dragLeave.bind(this)}
            onDrop={this.drop.bind(this)}
          >
            <VisBar/>
            <div className='visualization'>{visualization}</div>
            {dropIndicator}
          </div>
        </div>
      </main>
    `);
  }
}
