# Получаем директорию, в которой находится скрипт
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Пути к файлам конфигурации
$distConfigPath = Join-Path $scriptDir "config\config.json"
$tempConfigPath = Join-Path $scriptDir "..\..\temp_config\config.json"

# Преобразуем пути в абсолютные
$distConfigPath = [System.IO.Path]::GetFullPath($distConfigPath)
$tempConfigPath = [System.IO.Path]::GetFullPath($tempConfigPath)

Write-Host $distConfigPath
Write-Host $tempConfigPath

# Проверяем существование обоих файлов
if (!(Test-Path $distConfigPath) -or !(Test-Path $tempConfigPath)) {
    Write-Host "One of the configuration files is missing."
    Write-Host "The path to the distribution config: $distConfigPath"
    Write-Host "The path to the temporary config: $tempConfigPath"
    exit
}

# Читаем содержимое файлов
$distConfig = Get-Content $distConfigPath -Raw | ConvertFrom-Json
$tempConfig = Get-Content $tempConfigPath -Raw | ConvertFrom-Json

# Функция для рекурсивного объединения объектов
function Merge-Objects($target, $source) {
    foreach ($property in $source.PSObject.Properties) {
        if (!$target.PSObject.Properties[$property.Name]) {
            $target | Add-Member -MemberType NoteProperty -Name $property.Name -Value $property.Value
        } elseif ($property.Value -is [PSCustomObject]) {
            Merge-Objects $target.$($property.Name) $property.Value
        }
    }
}

# Объединяем конфигурации
Merge-Objects $distConfig $tempConfig

# Сохраняем обновленную конфигурацию
$distConfig | ConvertTo-Json -Depth 100 | Set-Content $distConfigPath

Write-Host "The configurations have been successfully combined."
Write-Host "The updated config is saved in: $distConfigPath"