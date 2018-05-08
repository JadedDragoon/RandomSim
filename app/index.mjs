import _ from "lodash";
import moment from "moment";
import { getField, getResult } from "./get_random.mjs";

const fieldSize     = _.toInteger(process.argv[2]) || 1024;
const winResults    = _.toInteger(process.argv[3]) || 1;
const reqIterations = _.toInteger(process.argv[4]) || 100000;
const chunkSize     = _.toInteger(process.argv[5]) || 100;
const numChunks     = (reqIterations / chunkSize);
const startTime     = moment();

if (winResults > fieldSize) {
    throw new TypeError('The number of win results ('+winResults+') must be less than field size ('+fieldSize+').')
}
if (_.isInteger(numChunks)) {
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
            "Processing Chunk: " +
            (numChunks+1 - i) +
            " of " +
            numChunks +
            " - " +
            moment.utc(now.diff(startTime)).format("HH:mm:ss")
        );
        let resultArr = [];

        for (let i = chunkSize; i > 0; i--) {
            let resultChunk = await getResult({
                max:   fieldSize,
                field: getField(fieldSize, winResults)
            })
            resultArr.push(_.slice(resultChunk));
        }
        
        countable.push(_.slice(Promise.all(_.slice(resultArr))));
    }

    return Promise.all(countable)
        .then((data) => {
            return {
                winners: _.filter(_.flatten(data), (val) => { return val[0]; }),
                raw: data
            };
        }).then((data) => {
            console.log(
                '\n' +
                '===============================================================================\n' +
                '|                            Statistics & Results                             |\n' +
                '===============================================================================\n' +
                'Iterations:     ' + reqIterations + "\n" +
                'Chance Each:    ' + winResults + '/' + fieldSize + "\n" +
                'Expected Wins: ~' + ((reqIterations * winResults) / fieldSize) + "\n" +
                'Actual Wins:    ' + _.size(data.winners) + "\n\n" +
                '===============================================================================\n' +
                '|                           RAW Simulation Results                            |\n' +
                '===============================================================================\n' +
                JSON.stringify(data.raw) + "\n\n"
            );
        });
})();
