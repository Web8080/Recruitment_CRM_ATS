# Timeout Solution Guide

## Problem
Ollama is timing out when parsing resumes, causing the system to fail.

## Root Cause
- Ollama models are slow (especially on first request - cold start)
- Large models (llama2: 3.8GB) take 60-180+ seconds to respond
- Network/connection issues can cause additional delays

## ✅ SOLUTION 1: Use OpenAI (RECOMMENDED - Fastest & Most Reliable)

This is the **best solution** for production use:

### Setup Steps:

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Update `.env` file**:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. **Restart backend**:
   ```bash
   cd src/backend-mock
   npm start
   ```

### Benefits:
- ✅ **Fast**: Responds in 2-5 seconds
- ✅ **Reliable**: No timeouts
- ✅ **Accurate**: Better JSON extraction
- ✅ **No setup**: No need to run Ollama locally
- ✅ **Cost-effective**: GPT-3.5-turbo is very affordable (~$0.0015 per resume)

### Cost Estimate:
- GPT-3.5-turbo: ~$0.0015 per resume parse
- 1000 resumes = ~$1.50
- Very affordable for production use

---

## ✅ SOLUTION 2: Use Smaller Ollama Model

If you prefer to use Ollama (free but slower):

### Option A: Use llama2:7b (if available)
```bash
# Check if available
ollama list

# If not, try to pull (may fail due to network)
ollama pull llama2:7b

# Update .env
OLLAMA_MODEL=llama2:7b
```

### Option B: Use TinyLlama (fastest but less accurate)
```bash
ollama pull tinyllama
# Update .env
OLLAMA_MODEL=tinyllama
```

### Option C: Use Phi (good balance)
```bash
ollama pull phi
# Update .env
OLLAMA_MODEL=phi
```

---

## ✅ SOLUTION 3: Hybrid Approach (Best of Both Worlds)

The system now automatically:
1. **Prefers OpenAI** if API key is configured (fast & reliable)
2. **Falls back to Ollama** if OpenAI is not available
3. **Falls back to OpenAI** if Ollama times out

### Setup:
```bash
# .env file
OPENAI_API_KEY=sk-your-key-here  # Primary (fast)
OPENAI_MODEL=gpt-3.5-turbo
OLLAMA_MODEL=llama2  # Fallback (free but slow)
```

This gives you:
- Fast parsing with OpenAI (primary)
- Free option with Ollama (fallback)
- Automatic failover if one fails

---

## ✅ SOLUTION 4: Optimize Ollama Performance

If you must use Ollama:

### 1. Pre-warm the model:
```bash
# Run this before starting the backend
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"llama2","prompt":"test","stream":false}'
```

### 2. Keep Ollama running:
```bash
# Start Ollama in a separate terminal
ollama serve

# Keep it running - don't close the terminal
```

### 3. Use system resources efficiently:
- Close other heavy applications
- Ensure at least 8GB free RAM
- Use SSD storage (faster model loading)

### 4. Monitor Ollama:
```bash
# Check if model is loaded
ollama ps

# Check available models
ollama list
```

---

## Current Implementation

The code now:
1. ✅ **Checks for OpenAI first** - Uses it if available (fastest)
2. ✅ **Falls back to Ollama** - Only if OpenAI not configured
3. ✅ **Has 180s timeout** - Gives Ollama enough time
4. ✅ **Better error messages** - Guides user to solution
5. ✅ **Returns partial data** - Shows extracted text even on failure

---

## Quick Fix (Immediate)

**Right now, the fastest solution:**

1. Get OpenAI API key: https://platform.openai.com/api-keys
2. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   ```
3. Restart backend
4. Done! ✅

This will make resume parsing **10-20x faster** and eliminate timeouts.

---

## Testing

After setup, test with:
```bash
# Test OpenAI (if configured)
curl -X POST http://localhost:7071/api/ai/parse-resume-file \
  -F "file=@your-resume.pdf"

# Should complete in 2-5 seconds
```

---

## Summary

| Solution | Speed | Cost | Reliability | Setup Difficulty |
|----------|-------|------|-------------|------------------|
| **OpenAI** | ⚡⚡⚡ Very Fast | 💰 Low ($0.0015/resume) | ✅✅✅ Excellent | ⭐ Easy |
| **Hybrid** | ⚡⚡ Fast | 💰 Free (fallback) | ✅✅✅ Excellent | ⭐⭐ Medium |
| **Ollama Small** | ⚡ Medium | 💰 Free | ✅✅ Good | ⭐⭐⭐ Hard |
| **Ollama Large** | 🐌 Slow | 💰 Free | ✅ Fair | ⭐⭐⭐ Hard |

**Recommendation**: Use **OpenAI** for production. It's fast, reliable, and very affordable.

