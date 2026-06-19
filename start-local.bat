@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting CS2 Case Lab from: %cd%
echo Open: http://localhost:8000/index.html
echo.
start "" "http://localhost:8000/index.html"
python -m http.server 8000
if errorlevel 1 (
  echo Python command failed. Trying py launcher...
  py -m http.server 8000
)
pause
