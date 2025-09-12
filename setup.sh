#!/bin/bash

# INGRES AI ChatBot Setup Script
# This script helps you set up the complete application

set -e

echo "🚀 INGRES AI ChatBot Setup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if Git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_status "Git is installed"
}

# Create necessary directories
create_directories() {
    print_header "Creating directories..."
    
    mkdir -p models/your-trained-model
    mkdir -p deployment/nginx/ssl
    mkdir -p logs
    
    print_status "Directories created successfully"
}

# Setup environment file
setup_environment() {
    print_header "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_status "Environment file created from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_status "Environment file already exists"
    fi
}

# Create sample model files (placeholder)
create_sample_model() {
    print_header "Creating sample model structure..."
    
    if [ ! -f models/your-trained-model/config.json ]; then
        cat > models/your-trained-model/config.json << EOF
{
    "model_type": "groundwater_prediction",
    "input_size": 10,
    "output_size": 3,
    "hidden_size": 64,
    "version": "1.0.0",
    "description": "Sample groundwater prediction model configuration"
}
EOF
        print_status "Sample model configuration created"
        print_warning "Replace with your actual trained model files"
    else
        print_status "Model configuration already exists"
    fi
}

# Build Docker images
build_images() {
    print_header "Building Docker images..."
    
    docker-compose build
    
    print_status "Docker images built successfully"
}

# Start services
start_services() {
    print_header "Starting services..."
    
    # Start in development mode by default
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Services started successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_header "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for database..."
    timeout 60 bash -c 'until docker exec ingres-postgres-dev pg_isready -U postgres; do sleep 2; done'
    
    # Wait for backend
    print_status "Waiting for backend API..."
    timeout 60 bash -c 'until curl -f http://localhost:8000/health; do sleep 2; done'
    
    # Wait for model server
    print_status "Waiting for model server..."
    timeout 60 bash -c 'until curl -f http://localhost:8001/health; do sleep 2; done'
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    timeout 60 bash -c 'until curl -f http://localhost:3000; do sleep 2; done'
    
    print_status "All services are ready!"
}

# Display access information
show_access_info() {
    print_header "🎉 Setup Complete!"
    echo ""
    echo "Your INGRES AI ChatBot is now running:"
    echo ""
    echo "📱 Frontend:     http://localhost:3000"
    echo "🔧 Backend API:  http://localhost:8000"
    echo "🤖 Model Server: http://localhost:8001"
    echo "📚 API Docs:     http://localhost:8000/docs"
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs:     docker-compose -f docker-compose.dev.yml logs -f"
    echo "  Stop services: docker-compose -f docker-compose.dev.yml down"
    echo "  Restart:       docker-compose -f docker-compose.dev.yml restart"
    echo ""
    echo "📁 Model Files:"
    echo "  Place your trained model files in: models/your-trained-model/"
    echo ""
    echo "🔧 Configuration:"
    echo "  Edit environment: .env"
    echo "  Database schema: database/schema.sql"
    echo ""
}

# Main setup function
main() {
    print_header "Starting INGRES AI ChatBot setup..."
    
    check_docker
    check_git
    create_directories
    setup_environment
    create_sample_model
    build_images
    start_services
    wait_for_services
    show_access_info
    
    print_status "Setup completed successfully! 🎉"
}

# Handle script arguments
case "${1:-}" in
    "prod")
        print_header "Setting up for production..."
        docker-compose -f docker-compose.prod.yml up -d
        ;;
    "dev")
        print_header "Setting up for development..."
        docker-compose -f docker-compose.dev.yml up -d
        ;;
    "stop")
        print_header "Stopping services..."
        docker-compose -f docker-compose.dev.yml down
        docker-compose -f docker-compose.prod.yml down
        ;;
    "clean")
        print_header "Cleaning up..."
        docker-compose -f docker-compose.dev.yml down -v
        docker-compose -f docker-compose.prod.yml down -v
        docker system prune -f
        ;;
    *)
        main
        ;;
esac
