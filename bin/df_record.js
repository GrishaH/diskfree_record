#!/usr/bin/env node
"use strict";

const df = require('@sindresorhus/df');
const sqlite3 = require('sqlite3').verbose();

const filename = './df_database.db';

let record_df = async (requestedMountpoint) => {
  let requestedDf;
  let dfArray = await df();
  for (let i = 0; i < dfArray.length; i++) { // Go through all mounted disks and find the one requested
    if (dfArray[i].mountpoint === requestedMountpoint) {
      requestedDf = dfArray[i];
    }
  };
  let time = await Date.now();
  let db = await new sqlite3.Database(filename, (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  await db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS df_table(mountpoint, space_used, space_available, time DEFAULT CURRENT_TIMESTAMP)');
    db.run('INSERT INTO df_table(mountpoint, space_used, space_available) VALUES(?,?,?)',
           [requestedDf.mountpoint, requestedDf.used, requestedDf.available]);
  });
  db.close();
};

let args = process.argv;
if (args.length === 3) {
  record_df(args[2])
} else {
  console.log('Incorrect number of arguments given (needs 1)');
  console.log('Specify the desired file system');
}