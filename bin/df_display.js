#!/usr/bin/env node
"use strict";

const asciichart = require ('asciichart')
const sqlite3 = require('sqlite3').verbose();
const assert = require('assert');

const filename = './df_database.db';

let display_df = async (requestedMountpoint, hoursToView = 24) => {
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
    let s0 = new Array(readData.length);
    for (let i = 0; i < s0.length; i++) {
      s0[i] = readData[i].space_available / 10**9; // 10^9 as this converts the space used data into GB
    }
    console.log(asciichart.plot(s0));
  });
  db.close();
};


let args = process.argv;
if (args.length === 3) {
  display_df(args[2]);
} else if ( args.length === 4 ) {
  assert(parseInt(args[3]) > 0);
  display_df(args[2], args[3]);
} else {
  console.log('Incorrect number of arguments given (needs 1, optional 2)');
  console.log('Specify the desired mountpoint, and optionally the timerange you would like to view in hours');
  console.log('(Default is 24 hours, enter 5 to view the past 5 hours)');
}