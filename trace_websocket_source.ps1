# PowerShell script to trace WebSocket connection source
Write-Host "Tracing WebSocket connection source..." -ForegroundColor Yellow

# Check if ollama package still exists
if (Test-Path "node_modules\ollama") {
    Write-Host "FOUND: ollama package still in node_modules" -ForegroundColor Red
    Remove-Item "node_modules\ollama" -Recurse -Force
    Write-Host "Removed ollama from node_modules" -ForegroundColor Green
}

# Search for any WebSocket or ollama references in all files
Write-Host "`nSearching for WebSocket/ollama references..." -ForegroundColor Yellow

$files = Get-ChildItem -Recurse -Include "*.ts", "*.js", "*.tsx", "*.jsx" | Where-Object { $_.FullName -notmatch "node_modules" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        if ($content -match "WebSocket|wss://|ws://|ollama|Ollama|/v2") {
            Write-Host "Found reference in: $($file.FullName)" -ForegroundColor Red
            # Show the specific lines
            $lines = $content -split "`n"
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "WebSocket|wss://|ws://|ollama|Ollama|/v2") {
                    Write-Host "  Line $($i+1): $($lines[$i].Trim())" -ForegroundColor Cyan
                }
            }
        }
    }
}

# Check package.json
Write-Host "`nChecking package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json

$hasOllama = $false
if ($packageJson.dependencies -and $packageJson.dependencies.ollama) {
    Write-Host "Found ollama in dependencies" -ForegroundColor Red
    $packageJson.dependencies.PSObject.Properties.Remove('ollama')
    $hasOllama = $true
}
if ($packageJson.devDependencies -and $packageJson.devDependencies.ollama) {
    Write-Host "Found ollama in devDependencies" -ForegroundColor Red  
    $packageJson.devDependencies.PSObject.Properties.Remove('ollama')
    $hasOllama = $true
}

if ($hasOllama) {
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "Cleaned package.json" -ForegroundColor Green
}

# Add error tracking to identify the exact source
Write-Host "`nAdding WebSocket error tracking..." -ForegroundColor Yellow

$indexContent = Get-Content "server\index.ts" -Raw

# Add error tracking at the top of index.ts
$errorTracker = @"
// WebSocket Error Tracker - Find the source
process.on('uncaughtException', (error) => {
  if (error.message && error.message.includes('WebSocket')) {
    console.error('WebSocket Error Source:', error.stack);
  }
});

process.on('unhandledRejection', (reason) => {
  if (reason && reason.toString().includes('WebSocket')) {
    console.error('WebSocket Rejection Source:', reason);
  }
});

"@

if ($indexContent -notmatch "WebSocket Error Tracker") {
    $indexContent = $errorTracker + $indexContent
    $indexContent | Set-Content "server\index.ts"
    Write-Host "Added WebSocket error tracking" -ForegroundColor Green
}

# Clear all caches
Write-Host "`nClearing caches..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force
}
npm cache clean --force 2>$null

Write-Host "`nTrace complete. Start the server to see detailed error sources." -ForegroundColor Green