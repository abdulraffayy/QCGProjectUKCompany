@echo off
echo Finding the source of WebSocket connections...
echo.

echo Searching for WebSocket-related code...
echo.

echo === Checking for direct WebSocket usage ===
findstr /r /s /i "WebSocket\|wss://\|ws://" *.ts *.js *.tsx *.jsx server\*.ts server\*.js client\src\*.ts client\src\*.tsx client\src\**\*.ts client\src\**\*.tsx 2>nul

echo.
echo === Checking for v2 endpoint references ===
findstr /r /s /i "/v2\|localhost/v2" *.ts *.js *.tsx *.jsx server\*.ts server\*.js client\src\*.ts client\src\*.tsx client\src\**\*.ts client\src\**\*.tsx 2>nul

echo.
echo === Checking package.json dependencies ===
findstr /i "ollama\|websocket\|ws" package.json

echo.
echo === Checking for any remaining ollama imports ===
findstr /r /s /i "import.*ollama\|from.*ollama\|require.*ollama\|new Ollama" *.ts *.js *.tsx *.jsx server\*.ts server\*.js client\src\*.ts client\src\*.tsx client\src\**\*.ts client\src\**\*.tsx 2>nul

echo.
echo === Checking node_modules for ollama ===
if exist "node_modules\ollama" (
    echo Found ollama in node_modules - needs to be removed
    dir node_modules\ollama
) else (
    echo No ollama package found in node_modules
)

echo.
echo === Checking for any cached modules ===
if exist "node_modules\.cache" (
    echo Found .cache directory - should be cleared
) else (
    echo No .cache directory found
)

echo.
echo Complete the scan and check results above.
pause