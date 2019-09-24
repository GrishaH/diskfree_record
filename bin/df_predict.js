#!/usr/bin/env node
"use strict";

const sqlite3 = require('sqlite3').verbose();
const assert = require('assert');
const extrap = require('ml-regression-polynomial');

const filename = './df_database.db';

let predict_df = async (requestedMountpoint, hoursToView = 24, hoursToPredict = 1, degree = 4) => {
  let x = [];
  let y = [];
  let readData;
  let sql = `SELECT mountpoint,
                    space_available,
                    time
             FROM df_table
             WHERE mountpoint = ? AND time >= datetime('now', '-${hoursToView} hour')`;
  let db = await new sqlite3.Database(filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
  db.all(sql, [requestedMountpoint], (err, rows) => {
    if (err) {
      throw err;
    }
    let readData = rows; // TODO
    for (let i = 0; i < readData.length; i++) {
      x.push(parseInt((new Date(readData[i].time).getTime() / 1000).toFixed(0)));
      y.push(readData[i].space_available);
    }

    let extrapolate = new extrap(x, y, degree);
    // give time via unix timestamp
    let temp = parseInt((new Date().getTime() / 1000).toFixed(0));
    console.log(temp);
    console.log(extrapolate.predict(temp + (60 * 60 * hoursToPredict)) / 10**9);
    console.log(extrapolate.toString(3));
  });
  db.close();
};

let args = process.argv;
if (args.length === 3) {
  predict_df(args[2]);
} else if ( args.length === 4 ) {
  assert(parseInt(args[3]) > 0);
  predict_df(args[2], args[3]);
} else if ( args.length === 5 || args.length === 6) {
  assert(parseInt(args[3]) > 0);
  predict_df(args[2], args[3], args[4], args[5]);
} else {
  console.log('Incorrect number of arguments given (needs 1, optional 2)');
  console.log('Specify the desired mountpoint, and optionally the timerange you would like to view in hours');
  console.log('(Default is 24 hours, enter 5 to view the past 5 hours)');
}