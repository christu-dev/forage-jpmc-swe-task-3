import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = { //declarative format for describing the structure of data, written in JSON
      stockprice_abc: 'float',
      stockprice_def: 'float',
      ratio: 'float', //to look for correlation weakening
      upper_bound: 'float', //+10%
      lower_bound: 'float', //-10%
      trigger_alert: 'float', //to check when bounds are crossed
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line'); //line graph view
      elem.setAttribute('row-pivots', '["timestamp"]'); //datapoints marked by time
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); //horizontal upper and lower bounds, a moving ratio, and a trigger alert
      //column pivots no longer needed, no need to distinguish the stocks
      elem.setAttribute('aggregates', JSON.stringify({ //average values of data point on same timestamps
        stockprice_abc: 'avg',
        stockprice_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

//lifecycle method that updates when graph gets new data
  componentDidUpdate() { 
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
