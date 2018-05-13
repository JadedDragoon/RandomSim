'use strict';
const _      = require('lodash');
const moment = require('moment');
const sqlite = require('better-sqlite3');
const { getField, getResult } = require('./get_random.js');

const fieldSize  = _.toSafeInteger(process.argv[2]) || 1024;
const winCount   = _.toSafeInteger(process.argv[3]) || 16;
const iterations = _.toSafeInteger(process.argv[4]) || 102400;
const chunkSize  = _.toSafeInteger(process.argv[5]) || 1024;
const numChunks  = (iterations / chunkSize);
const startTime  = moment();

if (winCount > fieldSize) {
    throw new TypeError('The number of win results ('+winCount+') must be less than field size ('+fieldSize+').')
}
if (!_.isInteger(numChunks)) {
    throw new TypeError('The chunk size ('+chunkSize+') must be a divisor of total iterations ('+iterations+').')
}

// async closure, to aid in handling async functions in a synchronous manner (to control memory usage)
(async () => {

    console.log(
        '\n' +
        'Creating clean database. Please wait...\n'
    )

    // create new, empty database
    const db = new sqlite('./database.sqlite');
    db.prepare('DROP TABLE IF EXISTS main').run();
    db.prepare('VACUUM').run();
    db.prepare('CREATE TABLE main (outcome BOOLEAN, field TEXT, result INTEGER)').run();

    console.log(
        '===============================================================================\n' +
        '|                                Configuration                                |\n' +
        '===============================================================================\n\n' +
        '  Requested Iterations: ' + iterations + '\n' +
        '  Chunk Size:           ' + chunkSize + " x" + numChunks + '\n' +
        '  Chance Per Iteration: ' + winCount + '-in-' + fieldSize + '\n' +
        '  Expected Wins:       ~' + ((iterations * winCount) / fieldSize) + '\n'
    );

    console.log(
        '\n' +
        '===============================================================================\n' +
        '|                                Processing...                                |\n' +
        '===============================================================================\n'
    );

    // chunk loop, each chunk is a new itteration of this loop
    const times = [];
    for (let ci = 1; ci <= numChunks; ci++) {
        let now = moment();
        let sql = 'INSERT INTO main (outcome, field, result) VALUES';
        
        // record time taken for previous chunk loop
        if (!_.isUndefined(times[0])) {
            times.push(
                now.diff(startTime)
                - _.sum(times)
            );
        } else if (!now.isSame(startTime, 'second')) {
            times.push(
                now.diff(startTime)
            );
        }

        console.log(
              '  ' + (
                    (!_.isUndefined(times[0]))
                    ? moment.utc(_.mean(times) * (numChunks - ci + 1)).format('HH:mm:ss')
                    : 'Calc....'
                )
            + ' - Simulating Chunk: ' + (ci)
            + ' of ' + numChunks
            + ' - ' + _.round(process.memoryUsage().heapTotal / 1024 / 1024, 0) + ':' + _.round(process.memoryUsage().heapUsed / 1024 / 1024, 0)
        );

        // sim loop, each simulation is a new itteration of this loop
        for (let si = 1; si <= chunkSize; si++) {
            let result = await getResult({
                max:   fieldSize,
                field: getField({size: fieldSize, wins: winCount})
            });
            
            sql +=
                ' (' +
                '"' + _.toString(result[0]) + '", ' +
                '"' + _.join(    result[1]) + '", ' +
                '"' + _.toString(result[2]) + '"'   +
                '),';
        }
        
        // remove trailing comma from sql statement
        sql = _.trimEnd(sql, ',');

        // execute prepaired insert statment
        db.prepare(sql).run();
    }

    console.log(
        '  Complete! Please wait while we read results from the database...'
    );

    // get results from DB
    const actWins = db.prepare('SELECT Count(*) FROM main WHERE outcome = "true"').get()["Count(*)"];
    const actIter = db.prepare('SELECT Count(*) FROM main').get()["Count(*)"];
    /*const rawResults = await db.all('SELECT outcome, field, result FROM main').then((data) => {
        // convert to back into array with correct datatypes
        return _.map(data, (obj) => { return [
            (obj.outcome === 'true'),
            _.map(_.split(obj.field, ','), _.toInteger),
            _.toSafeInteger(obj.result)
        ]});
    });*/

    debugger;
    console.log(
        '\n' +
        /*'===============================================================================\n' +
        '|                           RAW Simulation Results                            |\n' +
        '===============================================================================\n\n' +
        JSON.stringify(rawResults) + '\n\n' +*/
        '===============================================================================\n' +
        '|                            Statistics & Results                             |\n' +
        '===============================================================================\n\n' +
        '  Requested Iterations: ' + iterations + '\n' +
        //'  Actual Iterations:    ' + ((!_.isUndefined(actIter)) ? actIter : 'Disabled: Debug Only') + '\n' +
        '  Chance Per Iteration: ' + winCount + '-in-' + fieldSize + '\n' +
        '  Expected Wins:       ~' + ((iterations * winCount) / fieldSize) + '\n' +
        '  Actual Wins:          ' + actWins + '\n\n'
    );
})();
