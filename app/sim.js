'use strict';
const _      = require('lodash');
const moment = require('moment');
const Sqlite = require('better-sqlite3');
const { chunkLoop } = require('./sim_loops.js');

const fieldSize  = _.toSafeInteger(process.argv[3]) || 1024;
const winCount   = _.toSafeInteger(process.argv[4]) || 16;
const iterations = _.toSafeInteger(process.argv[5]) || 102400;
const chunkSize  = _.toSafeInteger(process.argv[6]) || 1024;
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
    );

    // create new, empty database
    const db = new Sqlite('./database.Sqlite');
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
        '===============================================================================\n' +
        '|                                Processing...                                |\n' +
        '===============================================================================\n'
    );

    await chunkLoop({
        fieldSize,
        winCount,
        chunkSize,
        numChunks,
        startTime,
        db
    });

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
        '  Actual Iterations:    ' + ((!_.isUndefined(actIter)) ? actIter : 'Disabled: Debug Only') + '\n' +
        '  Chance Per Iteration: ' + winCount + '-in-' + fieldSize + '\n' +
        '  Expected Wins:       ~' + ((iterations * winCount) / fieldSize) + '\n' +
        '  Actual Wins:          ' + actWins + '\n\n'
    );
})();
