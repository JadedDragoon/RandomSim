@ECHO OFF
IF EXIST "%~dp0\database.sqlite" DEL "%~dp0\database.sqlite"
node "%~dp0\index.js" %1 %2 %3 %4