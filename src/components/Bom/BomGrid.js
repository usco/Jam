import React from 'react';

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import {formatNumberTo} from '../utils/formatters'

import logger from '../utils/log'
let log = logger("test");
log.setLevel("info");

/*
  
*/
class BomGrid extends RxReact.Component {


  render(){
    return (
      <table {...props}>
          <thead>
              <tr>
                  {columns.map((column, i) => {
                      var columnHeader = transform(header, (result, v, k) => {
                          result[k] = k.indexOf('on') === 0? v.bind(null, column): v;
                      });

                      return (
                          <th
                              key={i + '-header'}
                              className={cx(column.classes)}
                              {...columnHeader}
                          >{column.header}</th>
                      );
                  })}
              </tr>
          </thead>
  }
}