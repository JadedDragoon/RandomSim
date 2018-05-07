import _ from "lodash-es";
import getField from "./get_random.mjs";
import getResult from "./get_random.mjs";

const fieldSize = process.argv[2];
const winResults = process.argv[3];
const reqIterations = process.argv[4];

_.forEach([fieldSize, winResults, reqIterations], (val) => {
    if (!_.isInteger(val)) { console.error('All parameters must be integers'); }
});

console.log(JSON.stringify(
    getResult(
        fieldSize,
        getField(fieldSize, winResults)
    )
));