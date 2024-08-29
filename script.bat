@echo off
title Update List Server Play Better

:: Set the path to the current folder
set current_dir=%~dp0

echo Current directory: %current_dir%

:: Move two directories up from the current location of the .bat file
cd /d "%current_dir%..\.."

:: Get the current folder after moving up
set new_dir=%cd%

echo New directory after moving up: %new_dir%

:: Path to the file that needs to be checked and deleted
set file_to_delete=%new_dir%\temp\resources\app\script.bat

echo Path to file script.bat: %file_to_delete%

:: Check if the file exists and delete it if it does
if exist "%file_to_delete%" (
    del "%file_to_delete%"
    echo File script.bat was deleted from folder resources\app.
) else (
    echo File script.bat was not found in folder resources\app.
)

:: Path to the "temp" folder
set temp_dir=%new_dir%\temp

:: Copy contents from the "temp" folder to the current folder, overwriting existing files
xcopy /s /e /y "%temp_dir%\*" "%new_dir%\"

:: Inform the user that the operation is complete
echo Copying completed.

:: Delete the "temp" folder and its contents
rmdir /s /q "%temp_dir%"
echo Temp folder was deleted.

cd /d "%current_dir%..\.."
set new_dir=%cd%
echo %new_dir%
:: Путь к slpb.exe
set slpb_path=%new_dir%\slpb.exe

:: Запуск slpb.exe
start /min "" "%slpb_path%"

:: Завершаем выполнение bat файла сразу после запуска exe
exit
