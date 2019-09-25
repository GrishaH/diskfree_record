#!/usr/bin/env node
"use strict";

const asciichart = require ('asciichart')
const sqlite3    = require('sqlite3').verbose();
const assert     = require('assert');
const program    = require('commander');

const filename = './df_database.db';

let display_df = async (requestedMountpoint, hoursToView) => {
  let sql = `SELECT space_available
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
    let s0 = new Array(rows.length);
    for (let i = 0; i < s0.length; i++) {
      s0[i] = rows[i].space_available / 10**9; // 10^9 as this converts the space used data into GB
    }
    console.log(asciichart.plot(s0));
  });
  db.close();
};

let mount_point;

program
  .arguments('<desired_mount_point>', 'desired mount point to display')
  .option('-v, --view_hours <number>', 'select how many hours to view', 24)
  .action(function (desired_mount_point) { mount_point = desired_mount_point; })
  .parse(process.argv);

if (typeof mount_point === 'undefined') {
  console.error('No mount point given - required parameter (1 required, 1 optional)');
  console.error('Specify the desired mount point, and optionally the timerange you would like to consider in hours.');
  process.exit(1);
}
display_df(mount_point, program.view_hours);