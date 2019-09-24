# Diskfree Record

Records the requested df (disk free) results in an sqlite database, while also displaying the stored values in a given time range using an ascii chart.

## Install

```console
$ npm install diskfree_record
```

## Usage

Make a record of the current df values (name, space used, space available, and current time) for the given mountpoint.
This is stored in df_database.db.
This can then be displayed in the terminal as an ascii chart.

```console
$ bin/df_record.js /home
$ bin/df_display.js /home
```
By default, it creates a database file called `df_databse.db` in the current working directory. 

To record the df values every 10 minutes, use a time-based job scheduler, such as crontab.

```console
$ */10 * * * * bin/df_record.js /home
```


