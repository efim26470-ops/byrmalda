@echo off
cd /d "%~dp0"
title CS2 Case Lab local server
echo Starting CS2 Case Lab from: %cd%
echo.
echo Open manually in your browser:
echo http://localhost:8000/index.html
echo.
echo If port 8000 is busy, close this window and change the port in this file.
echo.
python -m http.server 8000
pause
