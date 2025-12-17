# Getting Started

## Prerequisites

- Node.js 18+ and npm
- .NET 8 SDK
- Azure CLI (for deployment)
- Azure Functions Core Tools
- Git

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd src/backend/Functions
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Configure local settings:
   - Copy `local.settings.json.example` to `local.settings.json`
   - Update environment variables with your configuration

4. Run the Azure Functions:
```bash
func start
```

The API will be available at `http://localhost:7071`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd src/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:7071/api
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### AI Service Configuration

#### Using OpenAI (Production)

1. Set the following environment variables:
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-4
```

#### Using Ollama (Local Development)

1. Install and start Ollama:
```bash
# Install Ollama from https://ollama.ai
ollama serve
```

2. Pull a model:
```bash
ollama pull llama2
```

3. Set the following environment variables:
```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

## Running Tests

### Backend Tests

```bash
cd tests/unit/backend
dotnet test
```

### Frontend Tests

```bash
cd src/frontend
npm run test
```

### E2E Tests

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npx playwright test
```

## Deployment

See the deployment scripts in `scripts/deployment/` and the infrastructure templates in `infrastructure/bicep/`.


