# Setting Up a Faster Ollama Model

## Current Status
- **Current Model**: `llama2:latest` (3.8 GB, can be slow)
- **Recommended**: Use a smaller model for faster responses

## Option 1: Use llama2:7b Variant (Recommended)

The 7B variant is smaller and faster than the full llama2 model:

```bash
# Pull the 7B variant (if not already available)
ollama pull llama2:7b

# Update .env file
OLLAMA_MODEL=llama2:7b
```

## Option 2: Use OpenAI (Most Reliable)

Since Ollama is slow, the best option is to use OpenAI fallback:

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Update `.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

The system will automatically use OpenAI if Ollama times out.

## Option 3: Try Other Small Models

If network allows, try these smaller models:

```bash
# TinyLlama (637 MB - fastest but less accurate)
ollama pull tinyllama

# Phi-2 (1.6 GB - good balance)
ollama pull phi

# Mistral 7B (4.1 GB - better quality)
ollama pull mistral:7b
```

Then update `.env`:
```
OLLAMA_MODEL=tinyllama
# or
OLLAMA_MODEL=phi
# or
OLLAMA_MODEL=mistral:7b
```

## Testing Model Performance

Test if a model responds quickly:

```bash
# Test current model
time curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama2","prompt":"test","stream":false,"options":{"num_predict":10}}'

# Should respond in < 10 seconds for good performance
```

## Current Configuration

Your `.env` file should have:
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2:7b  # or your preferred model
OPENAI_API_KEY=your-key-here  # Recommended for fallback
OPENAI_MODEL=gpt-3.5-turbo
```

## Restart Required

After changing `.env`, restart the backend:
```bash
cd src/backend-mock
npm start
```

## Performance Comparison

| Model | Size | Speed | Quality | Recommended For |
|-------|------|-------|---------|-----------------|
| llama2:latest | 3.8 GB | Slow | Good | Development |
| llama2:7b | ~3.8 GB | Medium | Good | Better performance |
| tinyllama | 637 MB | Fast | Fair | Quick testing |
| phi | 1.6 GB | Fast | Good | Balanced |
| OpenAI GPT-3.5 | Cloud | Very Fast | Excellent | Production |

**Recommendation**: Use OpenAI for production, Ollama for development/testing.

