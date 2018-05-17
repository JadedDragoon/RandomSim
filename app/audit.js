'use strict';
const _      = require('lodash');
const fs     = require('fs');
const Sqlite = require('better-sqlite3');

const outpFile = _.toString(process.argv[2]);
const outpPath = /$.*\//.exec(outpFile);

if (!_.isEmpty(outpFile)) {
    throw new TypeError('You must specify the file to output raw data to.');
}
if (!fs.existsSync(outpPath)) {
    throw new Error('Path "' + outpPath + '" does not exist.');
}

const outpStream = fs.createWriteStream(outpFile);



outpStream.write(data);
