# Contributing to Gatherly

Thank you for your interest in contributing to **Gatherly**! We welcome contributions to enhance our smart budgeting, dynamic timeline generation, vendor tracking, and generative AI features.

## Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Rishisharma029/gatherly.git
cd gatherly
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Running Tests
```bash
# Backend pytest suite
backend\venv\Scripts\python.exe -m pytest backend/tests

# Frontend build & typecheck
cd frontend
npm run build
```

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit with descriptive messages.
3. Ensure all pytest tests and TypeScript typechecks pass.
4. Maintain the warm ivory (`#F8F7F2`) and deep forest green (`#1F5147`) design language.
5. Open a PR against `main`.
