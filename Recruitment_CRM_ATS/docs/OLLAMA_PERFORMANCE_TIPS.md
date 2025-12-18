# Ollama Performance Optimization Tips

## Problem Identified
Ollama is responding very slowly (timing out even on simple requests), which causes resume parsing to fail.

## Root Causes
1. **Cold Start**: First request to a model loads it into memory (can take 30-60 seconds)
2. **Model Size**: `llama2:latest` (7B parameters) can be slow on some systems
3. **System Resources**: Ollama needs sufficient RAM and CPU

## Solutions Implemented

### 1. Model Warmup
- Added a quick warmup request before the main parsing
- Helps pre-load the model into memory
- Reduces cold start delays

### 2. Increased Timeout
- Increased from 120s to 180s (3 minutes)
- Gives Ollama more time to process complex prompts

### 3. Optimized Prompt
- Reduced prompt length from 8000 to 6000 characters
- Simplified prompt structure
- Lower temperature (0.1) for more consistent JSON output

### 4. Reduced Token Limit
- Set `num_predict: 1500` (down from 2000)
- Faster response times
- Still sufficient for resume extraction

## Recommendations

### Option 1: Use Smaller Model (Fastest)
```bash
# Pull a smaller, faster model
ollama pull llama2:7b

# Or even smaller
ollama pull tinyllama
```

Then set in `.env`:
```
OLLAMA_MODEL=tinyllama
```

### Option 2: Use OpenAI (Most Reliable)
Set in `.env`:
```
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

The system will automatically fallback to OpenAI if Ollama times out.

### Option 3: Optimize Ollama Performance
```bash
# Check Ollama status
ollama ps

# Check available models
ollama list

# Pull optimized model
ollama pull llama2:7b

# Set environment variable
export OLLAMA_MODEL=llama2:7b
```

### Option 4: Increase System Resources
- Ensure sufficient RAM (at least 8GB free)
- Close other resource-intensive applications
- Consider using GPU acceleration if available

## Testing Ollama Performance

Test if Ollama is responding:
```bash
# Quick test
curl http://localhost:11434/api/tags

# Test generation (should respond in < 10 seconds)
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama2","prompt":"test","stream":false}'
```

If the test times out, Ollama is too slow and you should:
1. Use OpenAI fallback (recommended)
2. Use a smaller model
3. Check system resources

## Current Configuration

- **Timeout**: 180 seconds (3 minutes)
- **Model**: llama2 (default, can be changed)
- **Fallback**: OpenAI (if API key is set)
- **Warmup**: Enabled (helps with cold starts)

