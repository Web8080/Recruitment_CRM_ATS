# Ollama Setup Guide

## ✅ Current Status

**Ollama is installed and running!**
- Version: 0.12.5
- Service: Running on http://localhost:11434
- Current Model: llama2:latest (3.8 GB)

## 🚀 Quick Start

Your Ollama setup is ready to use! The Recruitment CRM/ATS will automatically use Ollama for AI-powered resume parsing.

### Current Configuration

- **Ollama URL**: http://localhost:11434
- **Default Model**: llama2:latest
- **Status**: ✅ Active and ready

## 📥 Recommended: Upgrade to Better Models

For better resume parsing and JSON extraction, consider downloading these models:

### Option 1: llama3:8b (Recommended)
**Best for JSON extraction and structured data**

```bash
ollama pull llama3:8b
```
- Size: ~4.7 GB
- Better JSON extraction than llama2
- More accurate resume parsing

### Option 2: mistral:7b
**Excellent for structured data extraction**

```bash
ollama pull mistral:7b
```
- Size: ~4.1 GB
- Great for structured outputs
- Good balance of speed and accuracy

### Option 3: Keep llama2:latest
**Current model - works but less accurate for JSON**

- Already installed
- Works for basic parsing
- May need manual JSON cleanup

## 🔧 Setup Script

Use the automated setup script:

```bash
./scripts/setup-ollama.sh
```

This script will:
- Check Ollama installation
- Verify service is running
- Offer to download better models
- Test the connection

## ⚙️ Configuration

### Change Default Model

Set environment variable in your backend:

```bash
# In .env or environment
OLLAMA_MODEL=llama3:8b
```

Or update `src/backend-mock/server.js`:
```javascript
const model = process.env.OLLAMA_MODEL || 'llama2:latest';
```

### Test Ollama Connection

```bash
curl http://localhost:11434/api/tags
```

### Test Resume Parsing

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama2:latest",
  "prompt": "Extract JSON: Name: John, Email: john@email.com, Skills: JavaScript",
  "stream": false
}'
```

## 🐛 Troubleshooting

### Ollama Not Running

```bash
# Start Ollama service
ollama serve

# Or on macOS, it should auto-start
# Check with:
ps aux | grep ollama
```

### Model Not Found

```bash
# List available models
ollama list

# Pull a model
ollama pull llama2:latest
```

### Port Already in Use

If port 11434 is in use:
```bash
# Check what's using it
lsof -i :11434

# Kill the process or change Ollama port
export OLLAMA_HOST=0.0.0.0:11435
```

### Slow Responses

- Use smaller models (llama2:7b instead of llama2:13b)
- Reduce temperature in prompts
- Use quantization (Q4_0 is default)

## 📊 Model Comparison

| Model | Size | JSON Quality | Speed | Recommended |
|-------|------|--------------|-------|-------------|
| llama2:latest | 3.8 GB | ⭐⭐⭐ | Fast | ✅ Current |
| llama3:8b | 4.7 GB | ⭐⭐⭐⭐⭐ | Fast | ⭐ Best |
| mistral:7b | 4.1 GB | ⭐⭐⭐⭐ | Fast | ✅ Good |
| llama2:13b | 7.3 GB | ⭐⭐⭐⭐ | Slow | ❌ Overkill |

## 🎯 For Production

1. **Use llama3:8b or mistral:7b** for better accuracy
2. **Set up model caching** to reduce load times
3. **Monitor performance** and adjust temperature
4. **Consider OpenAI fallback** for critical operations

## 📝 Notes

- Ollama runs locally - no API costs
- Models are downloaded once and cached
- First request may be slower (model loading)
- Keep Ollama service running while using the app

## ✅ Verification

Your setup is verified and working! The Recruitment CRM/ATS will use Ollama automatically for:
- Resume parsing
- Candidate data extraction
- AI-powered matching

No additional configuration needed - it's ready to use!


