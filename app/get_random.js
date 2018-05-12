'use strict';
const _       = require('lodash');
const randNum = require('random-number-csprng');

/**
 * @description Generates a field of 'wins' randomly assigned winning integer
 * results with no result smaller than 1 or larger than 'size' and with no
 * repeating results.
 * 
 * @param {Object} fieldDesc {size = 1024, wins = 1}
 * @param {number} fieldDesc.size Size of field (total number of possible
 * outcomes)
 * @param {number} fieldDesc.wins Number of unique winning results (outcomes
 * that will win)
 * 
 * @returns {Promise.number[]} Returns an array of numbers representing the
 * winning results in the field.
 */
function getField({size = 1024, wins = 1} = {}) {
    const arrOut = [];
    while (arrOut.length < wins) {
        arrOut.push(randNum(1, size));
    }
    return Promise.all(_.slice(arrOut))
        .then((dataArr) => {
            
            // gather statistic on random numbers produced
            dataArr = _.sortBy(dataArr);
            let counts = _.countBy(dataArr);
            let unused = [];
            for (i = 1; i <= size; i++) { if (!_.includes(dataArr, i)) unused.push(i); }

            // map all duplicate random numbers to unused numbers between 1 and size
            return _.map(dataArr, (value) => {
                let newVal;

                if (counts[value] > 1) {
                    counts[value]--;
                    newVal = unused.shift();
                } else {
                    newVal = value;
                }

                return newVal;
            });
        });
}

/**
 * @description Generates a random integer result no less than 1 and no greater
 * than 'max'. Then compairs that result to the provided field
 * 
 * @param {Object} resultDesc {max = 1024}
 * @param {number} resultDesc.max The maximum value that can be returned
 * @param {Promise.number[]} resultDesc.field A field array to compair the
 * random result against.
 * 
 * @returns {RResult} A random result object describing the criterea and
 * results of a single test.
 */
function getResult({max = 1024, field} = {}) {
    const result = randNum(1, max);
    const outcome = result.then((resData) => {
        return field.then((fieldData) => {
            return _.includes(_.slice(fieldData), resData);
        });
    });

    return Promise.all(_.slice([
        outcome,
        field,
        result
    ]));
}

/**
 * @module 'Get Random'
 */
module.exports = {
    getField,
    getResult
}

/**
 * @typedef {Promise.Array} RResult
 * @prop {boolean} outcome Whether the random result was a success or failure.
 * @prop {Promise.number[]} field A record of the field of winning results. 
 * @prop {Promise.number} result A record of the random result that was
 * compaired against [field]{@link RResult.field}.
 * @global
 */