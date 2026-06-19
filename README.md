# CS2 Case Lab v4

Статический фан-симулятор открытия кейсов CS2 для GitHub Pages.

## Как запустить локально правильно

1. Распакуй ZIP в обычную папку, например `C:\Users\ТвоёИмя\Desktop\cs2-case-lab-v4`.
2. Открой эту папку.
3. Дважды нажми `start-local.bat`.
4. Откроется `http://localhost:8000/index.html`.

Если запускаешь вручную, сначала перейди в папку проекта:

```bat
cd /d C:\Users\ТвоёИмя\Desktop\cs2-case-lab-v4
python -m http.server 8000
```

Не запускай `python -m http.server` из `C:\Windows\System32`, иначе браузер покажет системные DLL-файлы вместо сайта.

## Что исправлено в v4

- Баланс списывается через единую функцию `spend()`.
- Баланс начисляется через единую функцию `earn()`.
- Предметы добавляются в инвентарь через `addInventoryItem()`.
- Рулетка кейса крутится через реальный CSS transform с таймером результата.
- Инвентарь, продажа, апгрейд, контракты, колесо, реклама и battle работают от одного `localStorage`-состояния.
- Добавлен `favicon.svg`, чтобы не было запроса `/favicon.ico`.
- Добавлен `start-local.bat`, чтобы сервер запускался именно из папки сайта.
- Добавлена загрузка настоящих кейсов/скинов/картинок CS2 из открытого JSON API ByMykel CSGO-API при наличии интернета.
- Есть fallback-пул, если интернет или GitHub raw временно недоступен.

## GitHub Pages

Загрузи все файлы в корень репозитория:

- `index.html`
- `cases.html`
- `inventory.html`
- `upgrade.html`
- `contracts.html`
- `wheel.html`
- `battle.html`
- `ads.html`
- `profile.html`
- `styles.css`
- `app.js`
- `favicon.svg`
- `manifest.webmanifest`

Потом включи GitHub Pages: Settings → Pages → Deploy from branch → `main` → `/root`.

## Важно

Проект не связан с Valve, Steam или Counter-Strike. Это фан-симулятор без реальных платежей, депозитов, вывода предметов и азартных ставок.
