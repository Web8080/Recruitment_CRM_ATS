#!/bin/bash

# Ollama Setup Script for Recruitment CRM/ATS
# This script helps set up and manage Ollama models for AI functionality

set -e

echo "🔧 Ollama Setup for Recruitment CRM/ATS"
echo "========================================"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed."
    echo "📥 Installing Ollama..."
    
    if command -v brew &> /dev/null; then
        brew install ollama
    else
        echo "Please install Ollama manually from https://ollama.ai"
        exit 1
    fi
fi

echo "✅ Ollama is installed: $(ollama --version)"
echo ""

# Check if Ollama service is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama service is not running. Starting it..."
    ollama serve &
    sleep 3
fi

echo "✅ Ollama service is running"
echo ""

# List current models
echo "📋 Current models:"
ollama list
echo ""

# Recommended models for resume parsing
RECOMMENDED_MODELS=(
    "llama3:8b"      # Better JSON extraction than llama2
    "mistral:7b"    # Excellent for structured data
    "llama2:latest"  # Already installed, fallback
)

echo "💡 Recommended models for resume parsing:"
echo "   - llama3:8b (Best for JSON extraction)"
echo "   - mistral:7b (Excellent structured data)"
echo "   - llama2:latest (Current, works but less accurate)"
echo ""

# Check if llama3 is available
if ollama list | grep -q "llama3"; then
    echo "✅ llama3 is already installed"
else
    echo "📥 Would you like to download llama3:8b? (Better for JSON extraction)"
    echo "   This will download ~4.7 GB"
    read -p "   Download llama3:8b? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Downloading llama3:8b..."
        ollama pull llama3:8b
        echo "✅ llama3:8b downloaded successfully"
    fi
fi

# Check if mistral is available
if ollama list | grep -q "mistral"; then
    echo "✅ mistral is already installed"
else
    echo "📥 Would you like to download mistral:7b? (Excellent for structured data)"
    echo "   This will download ~4.1 GB"
    read -p "   Download mistral:7b? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📥 Downloading mistral:7b..."
        ollama pull mistral:7b
        echo "✅ mistral:7b downloaded successfully"
    fi
fi

echo ""
echo "🧪 Testing Ollama connection..."
TEST_RESPONSE=$(curl -s http://localhost:11434/api/generate -d '{
  "model": "llama2:latest",
  "prompt": "Say hello in one word",
  "stream": false
}' | grep -o '"response":"[^"]*"' | head -1)

if [ -n "$TEST_RESPONSE" ]; then
    echo "✅ Ollama is working correctly!"
    echo "   Test response: $TEST_RESPONSE"
else
    echo "⚠️  Ollama test failed. Please check the service."
fi

echo ""
echo "📝 Configuration:"
echo "   - Ollama URL: http://localhost:11434"
echo "   - Default model: llama2:latest"
echo "   - To change model, set OLLAMA_MODEL environment variable"
echo ""
echo "🚀 Setup complete! Your Recruitment CRM/ATS is ready to use AI features."
echo ""


