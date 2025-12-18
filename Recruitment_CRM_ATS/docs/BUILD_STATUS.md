# Build Status & Launch Instructions

## Build Summary

### ✅ Completed

1. **Frontend Build**: Successfully built React + TypeScript application
   - Build output: `src/frontend/dist/`
   - All TypeScript errors resolved
   - Fluent UI components properly integrated

2. **AI Service Integration**: 
   - Ollama as primary AI provider
   - OpenAI as fallback
   - Fallback service implemented with automatic retry logic

3. **Ollama Setup**:
   - Ollama service verified and running
   - llama2 model available (3.8 GB)

4. **Testing Framework**:
   - Frontend test configuration complete
   - Test dependencies installed (jsdom, vitest)
   - Test placeholders created

5. **Security Checks**:
   - npm audit completed
   - 5 moderate vulnerabilities detected (esbuild/vite related - dev dependencies only)
   - No hardcoded credentials found
   - .env files properly excluded from git

### ⚠️ Partial / Placeholder

1. **Backend (.NET)**:
   - .NET SDK requires manual installation (needs sudo password)
   - Installation command: `brew install --cask dotnet-sdk`
   - Mock backend provided as alternative (Node.js/Express)

2. **Backend Tests**:
   - Test project structure created
   - Requires .NET SDK to run

3. **E2E Tests**:
   - Playwright configuration placeholder
   - Requires .NET backend or mock backend running

4. **Deployment**:
   - Infrastructure templates created (Bicep)
   - Deployment scripts created (placeholders)
   - CI/CD pipelines configured (Azure DevOps, GitHub Actions)

## Current Running Services

### Frontend
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Process**: Check with `ps aux | grep vite`
- **Logs**: `/tmp/frontend.log`

### Mock Backend (Node.js)
- **URL**: http://localhost:7071
- **Status**: ✅ Running (if started)
- **Process**: Check with `ps aux | grep "node server.js"`
- **Logs**: `/tmp/mock-backend.log`
- **Features**:
  - Candidate CRUD operations
  - AI resume parsing (Ollama primary, OpenAI fallback)
  - Candidate matching (Ollama primary, OpenAI fallback)

### Azure Functions Backend (.NET)
- **Status**: ⚠️ Requires .NET SDK installation
- **Installation**: `brew install --cask dotnet-sdk`
- **After installation**: Run `cd src/backend/Functions && func start`

## Quick Start Commands

### Start Everything (Recommended)
```bash
./scripts/quick-build.sh
```

### Start Frontend Only
```bash
cd src/frontend
npm run dev
```

### Start Mock Backend
```bash
cd src/backend-mock
npm install  # First time only
node server.js
```

### Start .NET Backend (after installing .NET SDK)
```bash
cd src/backend/Functions
func start
```

## Testing

### Frontend Tests
```bash
cd src/frontend
npm run test        # Watch mode
npm run test:ci     # CI mode with coverage
```

### Backend Tests (requires .NET SDK)
```bash
cd tests/unit/backend
dotnet test
```

## Security Notes

1. **npm vulnerabilities**: 5 moderate severity (dev dependencies only)
   - Related to esbuild/vite versions
   - Can be fixed with `npm audit fix --force` (may cause breaking changes)
   - Not critical for development

2. **Environment Variables**: 
   - Never commit `.env` files
   - Use `.env.example` as template
   - Store secrets in Azure Key Vault for production

3. **API Keys**:
   - OpenAI API key: Set in `OPENAI_API_KEY` environment variable
   - Ollama: No API key needed (local service)

## Next Steps

1. **Install .NET SDK** (if you want full .NET backend):
   ```bash
   brew install --cask dotnet-sdk
   ```

2. **Configure AI Services**:
   - Ollama: Already running with llama2 model
   - OpenAI: Set `OPENAI_API_KEY` environment variable for fallback

3. **Complete Test Implementation**:
   - Add actual test cases (currently placeholders)
   - Implement E2E tests with Playwright

4. **Deployment**:
   - Configure Azure resources
   - Set up CI/CD pipeline secrets
   - Deploy to staging environment

## Troubleshooting

### Frontend not loading
- Check if port 3000 is available: `lsof -i :3000`
- Check logs: `tail -f /tmp/frontend.log`

### Backend not responding
- Mock backend: Check `tail -f /tmp/mock-backend.log`
- .NET backend: Check if `func` command is available
- Verify Ollama is running: `curl http://localhost:11434/api/tags`

### AI features not working
- Verify Ollama is running: `ollama list`
- Check Ollama logs if errors occur
- If OpenAI fallback needed, set `OPENAI_API_KEY` environment variable

## Architecture Decisions

1. **Ollama as Primary**: 
   - Cost-effective for development
   - No API rate limits
   - Data stays local (privacy)

2. **OpenAI as Fallback**:
   - Better accuracy for production
   - Handles complex queries better
   - Reliable API with SLA

3. **Mock Backend**:
   - Allows frontend development without .NET SDK
   - Same API contract as .NET backend
   - Easy to test and iterate


