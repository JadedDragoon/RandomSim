#!/bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"

if [ "$1" = "--audit" ];
then
    if [ -d "$2" ]; then echo 'Path for saving audit data does not exist!'; exit 1; fi
    if [ -e "$3" ];
    then
        read -p 'File Exists! Overwrite? (y/n)' -n 1 -a RESPONCE
        if [ ! "$RESPONCE" = "y" ]; then echo "Unable to save audit data."; exit 1; fi
    fi

    node $SCRIPTPATH/index.js --audit "$2/$3"
else
    if [ -f $SCRIPTPATH/database.sqlite ]; then rm $SCRIPTPATH/database.sqlite; fi

    node $SCRIPTPATH/index.js --sim $1 $2 $3 $4
fi
