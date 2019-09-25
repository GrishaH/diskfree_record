# Diskfree Record

Records the requested df (disk free) results in an sqlite database, while also displaying the stored values in a given time range using an ascii chart.

## Install

```console
$ npm install diskfree_record
```

## Usage

Make a record of the current df values (name, space used, space available, and current time) for the given mount point.
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

Additionally, a polynomial can be produced from the stored data and be used to extrapolate how much data will be available / used after a requested number of hours.
Do note that this feature is experimental and tends to be a little too optimistic or pessimistic depending on what options are given.

This will predict the estimated space available in one hour.
```console
$ bin/df_predict.js /home
```

For `df_display` and `df_predict`, you can specify optional parameters to fine-tune your output.

```console
$ bin/df_display.js /home -v 12
$ # Display the ascii chart for space available for the past 12 hours.
$ # -v or --view_hours, specify how many past hours to display. Default 24.
```
```console
$ bin/df_predict.js /home -v 12 -p 2 -d 3
$ # Display the estimated space available in two hour's time, using a polynomial
$ # with a degree of 3, using the data from the past 12 hours.
$ # -v or --view_hours, specify how many past hours to consider in calculation. Default 24.
$ # -p or --predict_hours, specify how many hours into the future to predict. Default 1 
$ # -d or --degree, specify what degree the produced polynomial should be in. Default 4.
```