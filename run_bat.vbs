' Создаем объект FileSystemObject
Set fso = CreateObject("Scripting.FileSystemObject")

' Открываем файл для добавления текста
Set logFile = fso.OpenTextFile("resources\app\logVbs.txt", 8, True)

' Записываем начальное сообщение в лог
logFile.WriteLine "Script started at " & Now

' Создаем объект WScript.Shell
Set WshShell = CreateObject("WScript.Shell")

' Записываем сообщение о создании объекта WScript.Shell
logFile.WriteLine "WScript.Shell object created"

' Задержка на 1 секунду (1000 миллисекунд)
WScript.Sleep 1000

' Записываем сообщение о задержке
logFile.WriteLine "Sleep for 1 second"

' Запускаем script.bat
WshShell.Run Chr(34) & "resources\app\script.bat" & Chr(34), 0

' Записываем сообщение о запуске script.bat
logFile.WriteLine "script.bat started"

' Освобождаем объект WScript.Shell
Set WshShell = Nothing

' Записываем сообщение о завершении скрипта
logFile.WriteLine "WScript.Shell object released"
logFile.WriteLine "Script finished at " & Now

' Закрываем файл
logFile.Close

' Освобождаем объект FileSystemObject
Set fso = Nothing