@echo off
title Update List Server Play Better

:: Set the path to the current folder
set current_dir=%~dp0

echo Current directory: %current_dir%
pause

:: Move two directories up from the current location of the .bat file
cd /d "%current_dir%..\.."

:: Get the current folder after moving up
set new_dir=%cd%

echo New directory after moving up: %new_dir%
pause

@REM :: Path to the file that needs to be checked and deleted
@REM set file_to_delete=%new_dir%\temp\resources\app\script.bat

@REM echo Path to file script.bat: %file_to_delete%
@REM pause

@REM :: Check if the file exists and delete it if it does
@REM if exist "%file_to_delete%" (
@REM     del "%file_to_delete%"
@REM     echo File script.bat was deleted from folder resources\app.
@REM ) else (
@REM     echo File script.bat was not found in folder resources\app.
@REM )

@REM pause

@REM :: Path to the "temp" folder
@REM set temp_dir=%new_dir%\temp

@REM :: Copy contents from the "temp" folder to the current folder, overwriting existing files
@REM xcopy /s /e /y "%temp_dir%\*" "%new_dir%\"

@REM :: Inform the user that the operation is complete
@REM echo Copying completed.

@REM :: Delete the "temp" folder and its contents
@REM rmdir /s /q "%temp_dir%"
@REM echo Temp folder was deleted.

@REM pause

:: Path to the slpb.exe
set slpb_path=splb.exe

:: Start slpb.exe
start "" "%slpb_path%"
echo slpb.exe has been launched.

pause