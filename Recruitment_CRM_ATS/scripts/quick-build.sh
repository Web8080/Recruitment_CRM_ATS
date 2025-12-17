#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "Quick Build & Launch (Frontend Focus)"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Ollama
if command -v ollama >/dev/null 2>&1; then
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "Starting Ollama..."
        ollama serve > /dev/null 2>&1 &
        sleep 3
    fi
    if ! ollama list 2>/dev/null | grep -q llama2; then
        echo "Pulling llama2 model..."
        ollama pull llama2
    fi
    echo -e "${GREEN}✓${NC} Ollama ready"
else
    echo -e "${YELLOW}⚠${NC} Ollama not found - AI features will use OpenAI fallback"
fi

# Build frontend
echo ""
echo "Building frontend..."
cd "$PROJECT_ROOT/src/frontend"
npm run build
echo -e "${GREEN}✓${NC} Frontend built"

# Run frontend tests
echo ""
echo "Running frontend tests..."
npm run test:ci || echo -e "${YELLOW}⚠${NC} Some tests may have issues"

# Security check
echo ""
echo "Running security checks..."
npm audit --audit-level=moderate || true

# Start services
echo ""
echo "Starting services..."

# Kill existing processes
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:7071 | xargs kill -9 2>/dev/null || true
sleep 2

# Start frontend
echo "Starting frontend on http://localhost:3000"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# Check .NET for backend
if command -v dotnet >/dev/null 2>&1; then
    echo "Building backend..."
    cd "$PROJECT_ROOT/src/backend"
    dotnet build --configuration Release || echo -e "${YELLOW}⚠${NC} Backend build had issues"
    
    if command -v func >/dev/null 2>&1; then
        echo "Starting backend on http://localhost:7071"
        cd "$PROJECT_ROOT/src/backend/Functions"
        func start > /tmp/backend.log 2>&1 &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
    else
        echo -e "${YELLOW}⚠${NC} Azure Functions Core Tools not found"
    fi
else
    echo -e "${YELLOW}⚠${NC} .NET SDK not found - backend not started"
    echo "To install: brew install --cask dotnet-sdk"
fi

echo ""
echo "=========================================="
echo "Services Started!"
echo "=========================================="
echo ""
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo "  PID: $FRONTEND_PID"
echo "  Logs: /tmp/frontend.log"
echo ""
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${GREEN}Backend:${NC} http://localhost:7071"
    echo "  PID: $BACKEND_PID"
    echo "  Logs: /tmp/backend.log"
    echo ""
fi
echo "Opening browser..."
sleep 2
open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 manually"


