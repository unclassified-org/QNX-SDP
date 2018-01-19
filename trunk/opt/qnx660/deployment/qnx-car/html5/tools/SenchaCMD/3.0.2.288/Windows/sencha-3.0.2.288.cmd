@echo off

:: Copyright (C) 2012, Sencha Inc.
:: All rights reserved

:: Since batch files are extrememly awkward at complex tasks, we delegate all the
:: work to a WSH file. We must also exit with the same exit code!

:: The %~dp0 trick uses %0 (the fullpath to this script) and keeps only the d(rive)
:: and p(ath) ... so _DIR will end with a \ character
set _DIR=%~dp0

cscript //nologo "%_DIR%sencha.wsh.js" %*

exit /b %ERRORLEVEL%
