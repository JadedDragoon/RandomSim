import _ from "lodash";
import Promise from "bluebird";
import { getField, getResult } from "./get_random.mjs";

const fieldSize = _.toInteger(process.argv[2]);
const winResults = _.toInteger(process.argv[3]);
const reqIterations = _.toInteger(process.argv[4]);
const chunkSize = _.toInteger(process.argv[5]);

_.forEach([fieldSize, winResults, reqIterations, chunkSize], (val) => {
    if (!_.isInteger(val)) {
        throw new TypeError(['All parameters must be integers.', JSON.stringify([fieldSize, winResults, reqIterations])]);
    }
});

(async function () {
    for (let i = (reqIterations / chunkSize); i > 0; i--) {
        let resultArr = [];
        for (let i = chunkSize; i > 0; i--) {
            let resultChunk = await getResult({
                max:   fieldSize,
                field: getField(fieldSize, winResults)
            })
            resultArr.push(resultChunk);
        }

        Promise.all(resultArr).then((data) => {
            debugger;
            console.log(JSON.stringify(_.filter(data, (val) => {
                return val[0];
            })));
        });
    }
})();