@echo off
echo Searching for WebSocket and Ollama imports in your project...
echo.

echo === Checking for 'ollama' package imports ===
findstr /r /s /i "import.*ollama\|from.*ollama\|require.*ollama" *.ts *.js server\*.ts server\*.js client\src\*.ts client\src\*.tsx client\src\**\*.ts client\src\**\*.tsx 2>nul

echo.
echo === Checking for direct Ollama class usage ===
findstr /r /s /i "new Ollama\|Ollama(" *.ts *.js server\*.ts server\*.js client\src\*.ts client\src\*.tsx client\src\**\*.ts client\src\**\*.tsx 2>nul

echo.
echo === Checking for WebSocket connections ===
findstr /r /s /i "WebSocket\|wss://\|ws://" *.ts *.js server\*.ts server\*.js client\src\*.ts client\src\*.tsx client\src\**\*.ts client\src\**\*.tsx 2>nul

echo.
echo === Checking package.json for ollama dependency ===
findstr /i "ollama" package.json 2>nul

echo.
echo If any results show above, those files need to be updated.
echo Run this file in your project root directory for diagnosis.
pause