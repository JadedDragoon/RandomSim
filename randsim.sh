#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
if [ -f $SCRIPTPATH/database.sqlite ]; then rm $SCRIPTPATH/database.sqlite; fi
$SCRIPTPATH/node $SCRIPTPATH/index.js $1 $2 $3 $4