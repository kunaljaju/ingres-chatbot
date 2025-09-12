@echo off
REM INGRES AI ChatBot Setup Script for Windows
REM This script helps you set up the complete application

echo 🚀 INGRES AI ChatBot Setup
echo ==========================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [INFO] Docker and Docker Compose are installed

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo [INFO] Git is installed

REM Create necessary directories
echo Creating directories...
if not exist "models\your-trained-model" mkdir "models\your-trained-model"
if not exist "deployment\nginx\ssl" mkdir "deployment\nginx\ssl"
if not exist "logs" mkdir "logs"

echo [INFO] Directories created successfully

REM Setup environment file
echo Setting up environment configuration...
if not exist ".env" (
    copy "env.example" ".env"
    echo [INFO] Environment file created from template
    echo [WARNING] Please edit .env file with your configuration
) else (
    echo [INFO] Environment file already exists
)

REM Create sample model files (placeholder)
echo Creating sample model structure...
if not exist "models\your-trained-model\config.json" (
    echo {> "models\your-trained-model\config.json"
    echo     "model_type": "groundwater_prediction",>> "models\your-trained-model\config.json"
    echo     "input_size": 10,>> "models\your-trained-model\config.json"
    echo     "output_size": 3,>> "models\your-trained-model\config.json"
    echo     "hidden_size": 64,>> "models\your-trained-model\config.json"
    echo     "version": "1.0.0",>> "models\your-trained-model\config.json"
    echo     "description": "Sample groundwater prediction model configuration">> "models\your-trained-model\config.json"
    echo }>> "models\your-trained-model\config.json"
    echo [INFO] Sample model configuration created
    echo [WARNING] Replace with your actual trained model files
) else (
    echo [INFO] Model configuration already exists
)

REM Build Docker images
echo Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build Docker images
    pause
    exit /b 1
)

echo [INFO] Docker images built successfully

REM Start services
echo Starting services...
docker-compose -f docker-compose.dev.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [INFO] Services started successfully

REM Wait for services to be ready
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo [INFO] All services are starting up!

REM Display access information
echo.
echo 🎉 Setup Complete!
echo.
echo Your INGRES AI ChatBot is now running:
echo.
echo 📱 Frontend:     http://localhost:3000
echo 🔧 Backend API:  http://localhost:8000
echo 🤖 Model Server: http://localhost:8001
echo 📚 API Docs:     http://localhost:8000/docs
echo.
echo 📋 Useful Commands:
echo   View logs:     docker-compose -f docker-compose.dev.yml logs -f
echo   Stop services: docker-compose -f docker-compose.dev.yml down
echo   Restart:       docker-compose -f docker-compose.dev.yml restart
echo.
echo 📁 Model Files:
echo   Place your trained model files in: models\your-trained-model\
echo.
echo 🔧 Configuration:
echo   Edit environment: .env
echo   Database schema: database\schema.sql
echo.
echo [INFO] Setup completed successfully! 🎉
echo.
echo Press any key to continue...
pause >nul
