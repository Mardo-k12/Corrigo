@echo off
REM Quick Start Script for Corrigo (Windows)

echo.
echo 🚀 Corrigo - Exam Grading System (10/10)
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Node.js not found. Please install Node.js 20.x
    pause
    exit /b 1
)

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  pnpm not found. Installing globally...
    call npm install -g pnpm
)

echo ✅ Prerequisites verified
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call pnpm install
echo ✅ Dependencies installed
echo.

REM Setup environment
echo ⚙️  Setting up environment...
if not exist .env.local (
    copy .env.example .env.local
    echo 📝 Created .env.local (update with your configuration)
) else (
    echo ✅ .env.local already exists
)
if not exist artifacts\api-server\.env.local (
    copy artifacts\api-server\.env.example artifacts\api-server\.env.local
    echo 📝 Created artifacts\api-server\.env.local
)
if not exist artifacts\smartgrader\.env.local (
    copy artifacts\smartgrader\.env.example artifacts\smartgrader\.env.local
    echo 📝 Created artifacts\smartgrader\.env.local
)
echo.

REM Database setup
echo 🗄️  Database setup...
pnpm migrate || echo ⚠️  Migration skipped (ensure PostgreSQL is running)
echo.

REM Available commands
echo ✅ Setup complete!
echo.
echo Available commands:
echo   pnpm dev              - Start all services in development mode
echo   pnpm test             - Run all tests
echo   pnpm test:e2e         - Run E2E tests (headless)
echo   pnpm test:e2e:open    - Run E2E tests (interactive)
echo   pnpm test:load        - Run load tests
echo   pnpm lint             - Lint check
echo   pnpm build            - Build all workspaces
echo.
echo Services will be available at:
echo   API Server: http://localhost:5001
echo   Web Frontend: http://localhost:5173
echo   Mobile API Base: http://localhost:5001/api
echo.
echo Ready to start development? Run:
echo   pnpm dev
echo.

pause
