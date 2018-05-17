'use strict';
const _      = require('lodash');
const moment = require('moment');
const { getField, getResult } = require('./get_random.js');

/**
 * @module 'Sim Loops'
 */
module.exports = {
    chunkLoop,
    simLoop
}

/**
 * The Chunk Loop. Performs all processing and bookkeeping needed for each
 * chunk and calls the simulation loop.
 * 
 * @param {Object} o An object containing members keyed to the below params.
 * @param {number} o.fieldSize The maximum value of any result
 * @param {number} o.winCount The number of values to consider wins
 * @param {number} o.chunkSize The number of iterations to run before returning
 * @param {number} o.numChunks The total number of chunks that will be run
 * @param {Moment} o.startTime A moment object indicating the time the
 * application was started
 * @param {Sqlite} o.db A better-sqlite database object belonging to the sqlite
 * database to be used as temp storage for simulation results
 * 
 * @returns {Promise.Statement} Returns a promise which resolves to a
 * better-sqlite prepaired statment on completion. Rejects to an error on any
 * failure.
 */
async function chunkLoop ({
    fieldSize,
    winCount,
    chunkSize,
    numChunks,
    startTime,
    db
}) {
    const times = [];
    let sqlPrepped;
    
    // chunk loop, each chunk is a new itteration of this loop
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

        sql += await simLoop({
            fieldSize,
            winCount,
            chunkSize
        });
        
        // remove trailing comma from sql statement
        sql = _.trimEnd(sql, ',');

        // execute prepaired insert statment
        sqlPrepped = db.prepare(sql);
        sqlPrepped.run();
    }
    
    return sqlPrepped;
}

/**
 * Simulation Loop. Loops through 'chunkSize' iterations of simulations and
 * returns the results as an SQL formated string of values.
 * 
 * @param {Object} o An object containing members keyed to the below params.
 * @param {number} o.fieldSize The maximum value of any result.
 * @param {number} o.winCount The number of values to consider wins.
 * @param {number} o.chunkSize The number of iterations to run before
 * returning.
 * 
 * @returns {Promise.string} Returns a promise which resolves to the results as
 * an SQL formated string of values. Rejects to an error on any failure.
 */
async function simLoop ({
    fieldSize,
    winCount,
    chunkSize
}) {
    const outp = [];
    
    // sim loop, each simulation is a new itteration of this loop
    for (let si = 1; si <= chunkSize; si++) {
        let result = await getResult({
            max:   fieldSize,
            field: getField({size: fieldSize, wins: winCount})
        });
        
        outp.push(_.join([
            _.toString(result[0]),
            _.join(    result[1]),
            _.toString(result[2])
        ], '", "'))
    }
    
    return '("' + _.join(outp, '"), ("') + '")';
}
