# Coorda Full-Stack Development Startup Script
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host "         COORDA - AI Event Planner & Workspace           " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; .\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "2. Starting Vite React Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers launched!" -ForegroundColor Green
Write-Host "Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "Frontend Web App: http://localhost:5173" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow
