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

:: Path to the file that needs to be checked and deleted
set file_to_delete=%new_dir%\temp\resources\app\script.bat

echo Path to file script.bat: %file_to_delete%
pause

:: Check if the file exists and delete it if it does
if exist "%file_to_delete%" (
    del "%file_to_delete%"
    echo File script.bat was deleted from folder resources\app.
) else (
    echo File script.bat was not found in folder resources\app.
)

set file_to_copy_res=%new_dir%\temp\resources\app\config\config.json

echo Path to file config.json: %file_to_copy_res%
pause

echo %file_to_copy_res%
if exist "%new_dir%\temp_config" (
    echo Temp folder exists.
    rmdir /s /q "%new_dir%\temp_config"
) else (
    if exist "%file_to_copy_res%" (
        echo File config.json exists.
        MD "%new_dir%\temp_config"
        echo Copying file config.json to temp_config folder.
        copy /Y %file_to_copy_res% "%new_dir%\temp_config"
    )
)

pause

powershell -ExecutionPolicy Bypass -File %current_dir%\merge_configs.ps1

pause

if exist "%new_dir%\temp_config" (
    echo Temp folder exists.
    rmdir /s /q "%new_dir%\temp_config"
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

pause

cd /d "%current_dir%..\.."
set new_dir=%cd%
echo %new_dir%
:: Путь к slpb.exe
set slpb_path=%new_dir%\slpb.exe

:: Запуск slpb.exe
start "" "%slpb_path%"

:: Завершаем выполнение bat файла сразу после запуска exe
exit