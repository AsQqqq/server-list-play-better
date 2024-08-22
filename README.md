# Список игровых серверов для PlayBetter
[Ссылка](https://playbetter.zone) на сайт `заказчика`

# Структура проекта
```
client_server_list
├─ design
│  └─ index.html
├─ fonts
│  ├─ Cannonade Bold.ttf
│  ├─ Cannonade.ttf
│  ├─ fontawesome-webfont.eot
│  ├─ fontawesome-webfont.svg
│  ├─ fontawesome-webfont.ttf
│  ├─ fontawesome-webfont.woff
│  ├─ fontawesome-webfont.woff2
│  └─ FontAwesome.otf
├─ image
│  ├─ am_mirage_custom.png
│  ├─ de_inferno.png
│  ├─ de_mirage.png
│  ├─ icon
│  │  ├─ circle.png
│  │  ├─ help.png
│  │  └─ play-icon.png
│  └─ icon_main.png
├─ package.json
├─ preload.js
├─ render.js
├─ script
│  ├─ common.js
│  └─ index.js
└─ style
   ├─ block.css
   ├─ error.css
   ├─ font-awesome.min.css
   ├─ load.css
   └─ style.css
```

# Запуск проекта в Node.js

В корне проекта:
``` powershell
npm start
```

# Рендер в исполняймый файл

В корне проекта:
``` powershell
npm buildWin
```

# Сборка в устанавлевыемый файл

Собираем проект используя Inno setup и конфиг файла install.iss
