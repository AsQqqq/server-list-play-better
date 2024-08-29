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

:: Path to the "temp" folder
set temp_dir=%new_dir%\temp
echo %temp_dir%

:: Copy contents from the "temp" folder to the current folder, overwriting existing files
xcopy /s /e /y "%temp_dir%\*" "%new_dir%\"

:: Inform the user that the operation is complete
echo Copying completed.

echo %temp_dir%\
if exist "%temp_dir%\" (
   :: Delete the "temp" folder and its contents
   rmdir /s /q "%temp_dir%"
   echo Temp folder was deleted.
) else (
   echo Temp folder not exist
)

cd /d "%current_dir%..\.."
set new_dir=%cd%
echo %new_dir%
:: Путь к slpb.exe
set slpb_path=%new_dir%\slpb.exe

:: Запуск slpb.exe
start /min "" "%slpb_path%"

:: Завершаем выполнение bat файла сразу после запуска exe
exit
