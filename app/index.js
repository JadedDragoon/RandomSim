const _         = require('lodash');
const moment    = require('moment');
const sqlite    = require('sqlite');
const getField  = require('./get_random.js').getField;
const getResult = require('./get_random.js').getResult;
//const heapdumpgen = require('./heapdumpgen').init('datadir');

const fieldSize     = _.toSafeInteger(process.argv[2]) || 1024;
const winResults    = _.toSafeInteger(process.argv[3]) || 1;
const reqIterations = _.toSafeInteger(process.argv[4]) || 102400;
const chunkSize     = _.toSafeInteger(process.argv[5]) || 1024;
const numChunks     = (reqIterations / chunkSize);
const startTime     = moment();

if (winResults > fieldSize) {
    throw new TypeError('The number of win results ('+winResults+') must be less than field size ('+fieldSize+').')
}
if (!_.isInteger(numChunks)) {
    throw new TypeError('The chunk size ('+chunkSize+') must be a divisor of total iterations ('+reqIterations+').')
}

// async closure, to aid in handling async functions in a synchronous manner (to control memory usage)
(async function () {

    // create database
    const db = await sqlite.open('./database.sqlite', { Promise });
    await db.run('DROP TABLE IF EXISTS main');
    await db.run('VACUUM');
    await db.run('CREATE TABLE main (outcome BOOLEAN, field TEXT, result INTEGER)');

    console.log(
        '\n' +
        '===============================================================================\n' +
        '|                                Processing...                                |\n' +
        '===============================================================================\n'
    );

    // chunk loop, each chunk is a new itteration of this loop
    for (let i = numChunks; i > 0; i--) {
        let now = moment();
        let sql = 'INSERT INTO main (outcome, field, result) VALUES';

        console.log(
              '  ' + moment.utc(now.diff(startTime)).format('HH:mm:ss')
            + ' - Processing Chunk: ' + (numChunks+1 - i)
            + ' of ' + numChunks
            + ' - ' + _.round(process.memoryUsage().heapTotal / 1024 / 1024, 0) + ':' + _.round(process.memoryUsage().heapUsed / 1024 / 1024, 0)
        );
        
        // sim loop, each simulation is a new itteration of this loop
        for (let i = chunkSize; i > 0; i--) {
            let result = await getResult({
                max:   fieldSize,
                field: getField(fieldSize, winResults)
            })
            
            // append results to prepaired sql statement
            sql += ' ("' +
                _.toString(result[0]) + '", "' +
                _.toString(result[1]) + '", "' +
                _.toString(result[2]) + '"),';
        }
        
        // remove extra comma from prepaired statement
        sql = _.trimEnd(sql, ',');

        // execute prepaired statment
        db.run(sql);
    }

    // store results
    const actIter    = await db.get('SELECT Count(*) FROM main').then((data) => { return data['Count(*)']; }); // resource intensive and unnecisary, debugging only
    const actWins    = await db.get('SELECT Count(*) FROM main WHERE outcome = "true"').then((data) => { return data['Count(*)']; });
    const rawResults = await db.all('SELECT outcome, field, result FROM main').then((data) => {
        // convert to back into array with correct datatypes
        return _.map(data, (obj) => { return [
            (obj.outcome === 'true'),
            _.map(_.split(obj.field, ','), _.toInteger),
            _.toSafeInteger(obj.result)
        ]});
    });

    console.log(
        '\n' +
        '===============================================================================\n' +
        '|                           RAW Simulation Results                            |\n' +
        '===============================================================================\n\n'
    )
    _.forEach(rawResults, (value) => {
        console.log('  ' + JSON.stringify(value));
    });
    console.log(
        '\n' +
        '===============================================================================\n' +
        '|                            Statistics & Results                             |\n' +
        '===============================================================================\n\n' +
        '  Requested Iterations: ' + reqIterations + '\n' +
        '  Actual Iterations:    ' + ((!_.isUndefined(actIter)) ? actIter : 'Disabled: Debug Only') + '\n' +
        '  Chance Per Iteration: ' + winResults + '-in-' + fieldSize + '\n' +
        '  Expected Wins:       ~' + ((reqIterations * winResults) / fieldSize) + '\n' +
        '  Actual Wins:          ' + actWins + '\n\n'
    );
})();
