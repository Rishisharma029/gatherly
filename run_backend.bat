@echo off
echo Starting Coorda FastAPI Backend on http://127.0.0.1:8000 ...
cd %~dp0
call backend\venv\Scripts\activate.bat
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
