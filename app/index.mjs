import _ from "lodash";
import moment from "moment";
import { getField, getResult } from "./get_random.mjs";

const fieldSize     = _.toInteger(process.argv[2]) || 1024;
const winResults    = _.toInteger(process.argv[3]) || 1;
const reqIterations = _.toInteger(process.argv[4]) || 1000;
const chunkSize     = _.toInteger(process.argv[5]) || 100;
const numChunks     = (reqIterations / chunkSize);
const startTime     = moment();

(async function () {
    const countable = [];

    for (let i = numChunks; i > 0; i--) {
        console.log(
            "Processing Chunk: " +
            (numChunks+1 - i) +
            " of " +
            numChunks +
            " - " +
            moment(startTime).fromNow(true)
        );
        let resultArr = [];

        for (let i = chunkSize; i > 0; i--) {
            let resultChunk = await getResult({
                max:   fieldSize,
                field: getField(fieldSize, winResults)
            })
            resultArr.push(_.slice(resultChunk));
        }
        
        countable.push(_.slice(Promise.all(resultArr)));
    }

    return Promise.all(countable)
        .then((data) => {
            return _.filter(_.flatten(data), (val) => { return val[0]; });
        }).then((data) => {
            console.log(
                'Expected: ~' + ((reqIterations * winResults) / fieldSize) + "\n" +
                'Recieved: ' + _.size(data)
            );
        });
})();
