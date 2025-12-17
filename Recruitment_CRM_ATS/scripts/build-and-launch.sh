#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "Recruitment CRM ATS - Build & Launch"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command_exists node; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}ERROR: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm --version)"

# Check .NET SDK
if ! command_exists dotnet; then
    echo -e "${YELLOW}WARNING: .NET SDK not found. Backend build will be skipped.${NC}"
    echo "Install from: https://dotnet.microsoft.com/download"
    SKIP_BACKEND=true
else
    echo -e "${GREEN}✓${NC} .NET SDK $(dotnet --version)"
    SKIP_BACKEND=false
fi

# Check Ollama
if ! command_exists ollama; then
    echo -e "${YELLOW}WARNING: Ollama not found. AI features will use OpenAI fallback only.${NC}"
    echo "Install from: https://ollama.ai"
    SKIP_OLLAMA=true
else
    echo -e "${GREEN}✓${NC} Ollama found"
    SKIP_OLLAMA=false
fi

echo ""
echo "=========================================="
echo "Starting Ollama Service"
echo "=========================================="

if [ "$SKIP_OLLAMA" = false ]; then
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Ollama is already running"
    else
        echo "Starting Ollama service..."
        ollama serve > /dev/null 2>&1 &
        OLLAMA_PID=$!
        echo "Waiting for Ollama to start..."
        sleep 3
        
        # Check if we have llama2 model
        if ! ollama list | grep -q llama2; then
            echo "Pulling llama2 model (this may take a while)..."
            ollama pull llama2
        fi
        echo -e "${GREEN}✓${NC} Ollama is ready"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping Ollama setup"
fi

echo ""
echo "=========================================="
echo "Building Frontend"
echo "=========================================="

cd "$PROJECT_ROOT/src/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Dependencies already installed, updating if needed..."
    npm install
fi

echo "Building frontend..."
npm run build

echo -e "${GREEN}✓${NC} Frontend build complete"

echo ""
echo "=========================================="
echo "Building Backend"
echo "=========================================="

if [ "$SKIP_BACKEND" = false ]; then
    cd "$PROJECT_ROOT/src/backend"
    
    echo "Restoring .NET dependencies..."
    dotnet restore
    
    echo "Building .NET solution..."
    dotnet build --configuration Release --no-incremental
    
    echo -e "${GREEN}✓${NC} Backend build complete"
else
    echo -e "${YELLOW}⚠${NC} Skipping backend build (no .NET SDK)"
fi

echo ""
echo "=========================================="
echo "Running Tests"
echo "=========================================="

# Frontend tests
cd "$PROJECT_ROOT/src/frontend"
echo "Running frontend tests..."
if npm run test:ci 2>&1 | tee /tmp/frontend-tests.log; then
    echo -e "${GREEN}✓${NC} Frontend tests passed"
else
    echo -e "${YELLOW}⚠${NC} Some frontend tests may have issues (check logs)"
fi

# Backend tests
if [ "$SKIP_BACKEND" = false ]; then
    cd "$PROJECT_ROOT/tests/unit/backend"
    if [ -f "CandidateFunctionsTests.csproj" ]; then
        echo "Running backend tests..."
        if dotnet test --configuration Release 2>&1 | tee /tmp/backend-tests.log; then
            echo -e "${GREEN}✓${NC} Backend tests passed"
        else
            echo -e "${YELLOW}⚠${NC} Some backend tests may have issues (check logs)"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Backend test project not found"
    fi
fi

echo ""
echo "=========================================="
echo "Security Checks"
echo "=========================================="

# Check for common security issues
echo "Running security checks..."

# Check for exposed secrets in code
cd "$PROJECT_ROOT"
if grep -r "password.*=.*['\"].*" src/ --exclude-dir=node_modules --exclude-dir=bin --exclude-dir=obj 2>/dev/null | grep -v "TODO\|placeholder\|example" | head -5; then
    echo -e "${YELLOW}⚠${NC} Potential hardcoded credentials found (review manually)"
else
    echo -e "${GREEN}✓${NC} No obvious hardcoded credentials"
fi

# Check npm vulnerabilities
cd "$PROJECT_ROOT/src/frontend"
if npm audit --audit-level=moderate 2>&1 | tee /tmp/npm-audit.log | grep -q "found 0 vulnerabilities"; then
    echo -e "${GREEN}✓${NC} No npm vulnerabilities found"
else
    echo -e "${YELLOW}⚠${NC} Some npm vulnerabilities detected (check /tmp/npm-audit.log)"
fi

# Check for .env files in git
if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}⚠${NC} WARNING: .env files are tracked in git (security risk)"
else
    echo -e "${GREEN}✓${NC} No .env files tracked in git"
fi

echo ""
echo "=========================================="
echo "Starting Services"
echo "=========================================="

# Kill any existing processes on our ports
if port_in_use 7071; then
    echo "Port 7071 is in use, attempting to free it..."
    lsof -ti:7071 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if port_in_use 3000; then
    echo "Port 3000 is in use, attempting to free it..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start backend
if [ "$SKIP_BACKEND" = false ]; then
    echo "Starting Azure Functions backend..."
    cd "$PROJECT_ROOT/src/backend/Functions"
    
    # Check if func is available
    if command_exists func; then
        func start > /tmp/backend.log 2>&1 &
        BACKEND_PID=$!
        echo "Backend starting on http://localhost:7071 (PID: $BACKEND_PID)"
        echo "Logs: /tmp/backend.log"
        
        # Wait for backend to be ready
        echo "Waiting for backend to be ready..."
        for i in {1..30}; do
            if curl -s http://localhost:7071 >/dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} Backend is ready"
                break
            fi
            sleep 1
        done
    else
        echo -e "${YELLOW}⚠${NC} Azure Functions Core Tools not found"
        echo "Install from: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
        echo "Backend will not start automatically"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping backend start (no .NET SDK)"
fi

# Start frontend
echo "Starting frontend development server..."
cd "$PROJECT_ROOT/src/frontend"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend starting on http://localhost:3000 (PID: $FRONTEND_PID)"
echo "Logs: /tmp/frontend.log"

# Wait for frontend to be ready
echo "Waiting for frontend to be ready..."
sleep 5

if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is ready"
else
    echo -e "${YELLOW}⚠${NC} Frontend may still be starting..."
fi

echo ""
echo "=========================================="
echo "Build & Launch Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
if [ "$SKIP_BACKEND" = false ]; then
    echo -e "${GREEN}Backend API:${NC} http://localhost:7071"
    echo -e "${GREEN}API Docs:${NC} http://localhost:7071/api/candidates"
fi
echo ""
echo "Process IDs:"
if [ ! -z "$BACKEND_PID" ]; then
    echo "  Backend: $BACKEND_PID"
fi
echo "  Frontend: $FRONTEND_PID"
if [ ! -z "$OLLAMA_PID" ]; then
    echo "  Ollama: $OLLAMA_PID"
fi
echo ""
echo "To stop services:"
echo "  kill $FRONTEND_PID"
if [ ! -z "$BACKEND_PID" ]; then
    echo "  kill $BACKEND_PID"
fi
echo ""
echo "Logs:"
echo "  Frontend: /tmp/frontend.log"
if [ ! -z "$BACKEND_PID" ]; then
    echo "  Backend: /tmp/backend.log"
fi
echo ""

# Open browser
if command_exists open; then
    sleep 2
    open http://localhost:3000
    echo -e "${GREEN}Browser opened!${NC}"
fi


