#!/usr/bin/env node
"use strict";

const sqlite3 = require('sqlite3').verbose();
const assert  = require('assert');
const extrap  = require('ml-regression-polynomial');
const program = require('commander');

const filename = './df_database.db';

let predict_df = async (requestedMountpoint, startHoursView, endHoursView, hoursToPredict, degree) => {
  let x = [];
  let y = [];
  let sql = `SELECT space_available,
                    time
             FROM df_table
             WHERE mountpoint = ? AND time >= datetime('now', '-${startHoursView} hour')
                                  AND time <= datetime('now', '-${endHoursView} hour')`;
  let db = await new sqlite3.Database(filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error(err.message);
    }
  });
  db.all(sql, [requestedMountpoint], (err, rows) => {
    if (err) {
      throw err;
    }
    for (let i = 0; i < rows.length; i++) {
      x.push(parseInt((new Date(rows[i].time).getTime() / 1000).toFixed(0)));
      y.push(rows[i].space_available);
    }

    // extrapolate the space used/available on currently existing data + degree given
    let extrapolate = new extrap(x, y, degree);
    // give time via unix timestamp
    let temp = parseInt((new Date().getTime() / 1000).toFixed(0));

    console.log('Current UNIX timestamp: ');
    console.log(temp);
    console.log('Estimated value: ');
    console.log(extrapolate.predict(temp + (60 * 60 * hoursToPredict)) / 10**9);
    console.log('Polynomial: ');
    console.log(extrapolate.toString(3));
  });
  db.close();
};

let mount_point;

program
  .arguments('<desired_mount_point>', 'desired mount point')
  .option('-s, --start_view_hours <number>', 'select how many hours to view back start', 24)
  .option('-e, --end_view_hours <number>', 'select how many hours to view back end (requires start > end)', 0)
  .option('-p, --predict_hours <number>', 'how many hours into the future to predict', 1)
  .option('-d, --degree <number>', 'what degree of polynomial to use', 4)
  .action(function (desired_mount_point) { mount_point = desired_mount_point; })
  .parse(process.argv);

if (typeof mount_point === 'undefined') {
  console.error('No mount point given - required parameter (1 required, 3 optional)');
  console.error('Specify the desired mount point, and optionally the timerange you would like to consider in hours,');
  console.error('how many hours into the future you would like to predict, and the degree of the polynomial used.');
  process.exit(1);
}
predict_df(mount_point, program.start_view_hours, program.end_view_hours, program.predict_hours, program.degree);