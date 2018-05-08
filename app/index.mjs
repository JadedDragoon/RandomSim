import _ from "lodash";
//import Promise from "bluebird";
import { getField, getResult } from "./get_random.mjs";

const fieldSize     = _.toInteger(process.argv[2]) || 1024;
const winResults    = _.toInteger(process.argv[3]) || 1;
const reqIterations = _.toInteger(process.argv[4]) || 1000;
const chunkSize     = _.toInteger(process.argv[5]) || 100;

_.forEach([fieldSize, winResults, reqIterations, chunkSize], (val) => {
    if (!_.isInteger(val)) {
        throw new TypeError(['All parameters must be integers.', JSON.stringify([fieldSize, winResults, reqIterations])]);
    }
});

(async function () {
    const countable = [];
    for (let i = (reqIterations / chunkSize); i > 0; i--) {
        console.log("Processing Chunk: " + ((reqIterations / chunkSize) - i + 1) + " of " + (reqIterations / chunkSize));
        let resultArr = [];
        for (let i = chunkSize; i > 0; i--) {
            let resultChunk = await getResult({
                max:   fieldSize,
                field: getField(fieldSize, winResults)
            })
            resultArr.push(resultChunk);
        }
        
        countable.push(Promise.all(resultArr));
    }
    return Promise.all(countable)
        .then((data) => {
            return _.filter(_.flatten(data), (val) => { return val[0]; });
        }).then((data) => {
            console.log(_.size(data));
        });
})();

