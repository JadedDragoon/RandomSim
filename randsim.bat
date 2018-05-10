@ECHO OFF
IF EXIST "%~dp0\database.sqlite" DEL "%~dp0\database.sqlite"
"%~dp0\node.exe" "%~dp0\index.js" %1 %2 %3 %4