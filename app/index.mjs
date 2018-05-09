const _         = require('lodash');
const moment    = require('moment');
const getField  = require('./get_random.mjs').getField;
const getResult = require('./get_random.mjs').getResult;
//const heapdumpgen = require('./heapdumpgen').init('datadir');

const fieldSize     = _.toInteger(process.argv[2]) || 1024;
const winResults    = _.toInteger(process.argv[3]) || 1;
const reqIterations = _.toInteger(process.argv[4]) || 100000;
const chunkSize     = _.toInteger(process.argv[5]) || 100;
const numChunks     = (reqIterations / chunkSize);
const startTime     = moment();

if (winResults > fieldSize) {
    throw new TypeError('The number of win results ('+winResults+') must be less than field size ('+fieldSize+').')
}
if (!_.isInteger(numChunks)) {
    throw new TypeError('The chunk size ('+chunkSize+') must be a divisor of total iterations ('+reqIterations+').')
}

(async function () {
    const countable = [];
    console.log(
        '\n' +
        '===============================================================================\n' +
        '|                                Processing...                                |\n' +
        '===============================================================================\n'
    );

    for (let i = numChunks; i > 0; i--) {
        let now = moment();
        console.log(
            "  " + moment.utc(now.diff(startTime)).format("HH:mm:ss") +
            " - Processing Chunk: " + (numChunks+1 - i) +
            " of " + numChunks +
            " - " + _.round(process.memoryUsage().heapTotal / 1024 / 1024, 0) + ":" + _.round(process.memoryUsage().heapUsed / 1024 / 1024, 0)
        );
        let resultArr = [];

        for (let i = chunkSize; i > 0; i--) {
            let resultChunk = await getResult({
                max:   fieldSize,
                field: getField(fieldSize, winResults)
            })
            resultArr.push(_.slice(resultChunk));
        }
        
        countable.push(_.slice(resultArr));
    }

            console.log(
                '\n' +
                '===============================================================================\n' +
        '|                           RAW Simulation Results                            |\n' +
                '===============================================================================\n' +
        JSON.stringify(countable) + "\n\n" + 
                '===============================================================================\n' +
        '|                            Statistics & Results                             |\n' +
                '===============================================================================\n' +
        '  Iterations:        ' + reqIterations + "\n" +
        //'  Actual Iterations: ' + _.size(_.flatten(countable)) + "\n" + //memory intensive and unnecisary, debugging only
        '  Chance Each:       ' + winResults + '/' + fieldSize + "\n" +
        '  Expected Wins:    ~' + ((reqIterations * winResults) / fieldSize) + "\n" +
        '  Actual Wins:       ' + _.size(_.filter(_.flatten(countable), (val) => { return val[0]; })) + "\n\n"        
            );
})();
