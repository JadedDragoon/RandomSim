'use strict';

if (process.argv[2] === '--sim') {
    require('./app/sim.js');
} else if (process.argv[2] === '--audit') {
    require('./app/audit.js');
}