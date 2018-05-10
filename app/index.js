const _         = require('lodash');
const moment    = require('moment');
const sqlite    = require('sqlite');
const getField  = require('./get_random.js').getField;
const getResult = require('./get_random.js').getResult;

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
(async () => {

    console.log(
        '\n' +
        'Cleaning up past results. Please wait...\n\n'
    )

    // create new, empty database
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
                    ? moment.utc(_.mean(_.slice(times, times.length-21)) * (numChunks - ci)).format('HH:mm:ss')
                    : 'Calc....'
                )
            + ' - Processing Chunk: ' + (ci)
            + ' of ' + numChunks
            + ' - ' + _.round(process.memoryUsage().heapTotal / 1024 / 1024, 0) + ':' + _.round(process.memoryUsage().heapUsed / 1024 / 1024, 0)
        );
        
        // sim loop, each simulation is a new itteration of this loop
        for (let si = 1; si <= chunkSize; si++) {
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

        // execute prepaired insert statment
        db.run(sql);
    }

    // get results from DB
    const actWins    = await db.get('SELECT Count(*) FROM main WHERE outcome = "true"').then((data) => { return data['Count(*)']; });
    //const actIter    = await db.get('SELECT Count(*) FROM main').then((data) => { return data['Count(*)']; }); // resource intensive and unnecisary, debugging only
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
        '  Requested Iterations: ' + reqIterations + '\n' +
        //'  Actual Iterations:    ' + ((!_.isUndefined(actIter)) ? actIter : 'Disabled: Debug Only') + '\n' +
        '  Chance Per Iteration: ' + winResults + '-in-' + fieldSize + '\n' +
        '  Expected Wins:       ~' + ((reqIterations * winResults) / fieldSize) + '\n' +
        '  Actual Wins:          ' + actWins + '\n\n'
    );
})();
