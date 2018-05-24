'use strict';
const _      = require('lodash');
const fs     = require('fs');
const Sqlite = require('better-sqlite3');

const outpFile = _.toString(process.argv[3]);
const outpPath = /.*\//.exec(outpFile)[0];

if (_.isEmpty(outpFile)) {
    throw new TypeError('You must specify the file to output raw data to.');
}
if (!fs.existsSync(outpPath)) {
    throw new Error('Path "' + outpPath + '" does not exist.');
}

// create sql iterator object to let us return the database content row-by-row
const db = new Sqlite("./database.sqlite", { readonly: true, fileMustExist: true });
const sqlIterator = db.prepare('SELECT * FROM main').iterate();

// create output stream and necisary listeners.
const outpStream = fs.createWriteStream(outpFile);
outpStream.once('open', outpWrite);
outpStream.on('drain', outpWrite);

function outpWrite() {
    outpStream.write(data);
}
