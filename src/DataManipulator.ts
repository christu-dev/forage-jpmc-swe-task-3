import { ServerRespond } from './DataStreamer';

//Row interface matches schema in Graph component
export interface Row {
  stockprice_abc: number,
  stockprice_def: number,
  ratio: number,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
  timestamp: Date,
}
//this interface determines structure of the object returned by generateRow
//the return object must correspond to the schema in Graph

export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]) : Row {
    //calculating stock prices as the avg of top ask and bid (like in task 1)
    //serverRespond is accessible as an array, first elem is stock ABC's data
    const price_ABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const price_DEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
    const ratio = price_ABC / price_DEF;
    //const upperBound = 1 + 0.10; //+10% of 12 month historical avg
    //const lowerBound = 1 - 0.10; //-10% of 12 month historical avg
    const upperBound = 1 + 0.03; 
    const lowerBound = 1 - 0.03;
      return {
        stockprice_abc: price_ABC,
        stockprice_def: price_DEF,
        ratio,
        
        upper_bound: upperBound,
        lower_bound: lowerBound,
        trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
        timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
          serverRespond[0].timestamp : serverRespond[1].timestamp,
      };
  } //return value is a single Row Object
}
