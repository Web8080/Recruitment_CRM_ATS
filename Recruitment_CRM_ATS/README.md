# Recruitment CRM / ATS System

A modern, AI-powered Recruitment Customer Relationship Management and Applicant Tracking System built on Microsoft Dynamics 365 and Power Platform principles, with DevSecOps best practices.

## Features

### 🎯 Core Features

#### Candidate Management
- **Complete Candidate Profiles**: Store and manage comprehensive candidate information including contact details, skills, experience, and education
- **Resume Upload & Parsing**: Drag-and-drop resume upload with AI-powered automatic data extraction
- **Auto-Population**: Automatically fill candidate forms from parsed resume data - no manual entry required
- **Skills Extraction**: AI identifies and extracts candidate skills, displayed as visual badges
- **Status Tracking**: Track candidates through the recruitment pipeline with color-coded status badges
- **Search & Filter**: Quickly find candidates using search and filtering capabilities
- **Bulk Operations**: Manage multiple candidates efficiently

#### AI-Powered Resume Processing
- **Multi-Format Support**: Upload and parse PDF, DOCX, DOC, and TXT resume files
- **Intelligent Extraction**: AI automatically extracts:
  - Personal information (name, email, phone)
  - Skills and competencies
  - Work experience (companies, positions, durations)
  - Education history (institutions, degrees, years)
  - Professional summary
- **Dual AI Provider Support**:
  - **Primary**: Ollama (local, free, privacy-focused)
  - **Fallback**: OpenAI (production-grade, high accuracy)
- **Automatic Fallback**: Seamlessly switches to OpenAI if Ollama is unavailable
- **Real-time Processing**: Fast resume parsing with progress indicators

#### Analytics & Reporting
- **Recruitment Dashboard**: Comprehensive overview of recruitment metrics and KPIs
- **Pipeline Visualization**: Visual representation of candidates through recruitment stages
- **Performance Metrics**: Track key performance indicators including:
  - Total and active candidates
  - AI processing rates
  - Average time to hire
  - Response times
  - Interview to offer conversion rates
  - Offer acceptance rates
- **Trend Analysis**: Monitor recruitment trends and monthly statistics
- **Progress Tracking**: Visual progress bars for each stage of the recruitment pipeline
- **Custom Dashboard Builder**: Create custom analytics dashboards
- **Advanced Charts**: Interactive charts and graphs (Pie, Bar, Line charts)
- **Predictive Analytics**: Time-to-fill predictions and forecasting
- **Source Effectiveness Analysis**: Track which sources yield best candidates
- **Cost-per-Hire Calculations**: Calculate recruitment costs
- **Diversity Metrics**: Track diversity in hiring
- **Export Functionality**: Export analytics data to CSV, Excel, PDF
- **Custom Reports**: Build and schedule custom reports

#### Job Management
- **Job Posting Management**: Create, edit, and manage job postings
- **Application Tracking**: Track applications for each job posting
- **Status Management**: Monitor application status throughout the hiring process
- **Auto-Posting to Job Boards**: Automatically post jobs to LinkedIn and Indeed
- **Source Tracking**: Track candidate sources from job boards

#### Calendar & Interview Scheduling
- **Calendar View**: Day, week, and month views for interview scheduling
- **Interview Scheduling**: Schedule interviews with time slots
- **Calendar Integration**: Google Calendar and Outlook integration (placeholders)
- **Automated Reminders**: Email and SMS reminders for interviews
- **Video Interview Links**: Support for Zoom, Teams, Google Meet
- **Interviewer Availability**: Manage interviewer availability
- **Time Zone Handling**: Automatic time zone conversion
- **Recurring Interview Slots**: Set up recurring interview availability

#### Notes & Comments
- **Rich Text Notes**: Create formatted notes on candidates, jobs, and applications
- **@Mentions**: Mention team members in notes
- **Private vs Public Notes**: Control note visibility
- **Note Attachments**: Attach files to notes
- **Note Search**: Search across all notes
- **Note Templates**: Use templates for common note types
- **Activity-Linked Notes**: Notes automatically linked to activities

#### Export & Reporting
- **CSV Export**: Export candidates, jobs, applications to CSV
- **Excel Export**: Export data to Excel format
- **PDF Reports**: Generate PDF reports with charts and visualizations
- **Custom Report Builder**: Build custom reports with drag-and-drop interface
- **Scheduled Reports**: Automatically generate and email reports
- **Report Templates**: Pre-built report templates
- **GDPR-Compliant Exports**: Export candidate data in GDPR-compliant format

#### CRM Features
- **Lead Management**: Manage candidate leads and prospects
- **Candidate Nurturing Campaigns**: Automated email campaigns for candidate engagement
- **Talent Pool Management**: Build and manage talent pools
- **Relationship Scoring**: Score candidate relationships
- **Engagement Tracking**: Track candidate engagement levels

#### Compliance & Legal
- **GDPR Compliance Tools**: Tools for GDPR compliance
- **Right to be Forgotten**: Automated data deletion on request
- **Data Retention Policies**: Automated data retention and deletion
- **Audit Trail**: Complete audit log of all system activities
- **Compliance Reporting**: Generate compliance reports

#### Integration Ecosystem
- **HRIS Integration**: Integration with Workday, BambooHR (placeholders)
- **Background Check Services**: Integration with background check providers
- **Reference Check Automation**: Automated reference checking
- **Onboarding Integration**: Integration with onboarding systems
- **Slack/Teams Notifications**: Send notifications to Slack and Teams

#### AI Services
- **Resume Parsing**: Extract structured data from resume text or files
- **Candidate Matching**: AI-powered matching of candidates to job descriptions with:
  - Match score (0-100)
  - Strengths and weaknesses analysis
  - Skills gap identification
  - Recommendation insights
- **Interview Question Generation**: Generate relevant interview questions based on job requirements
- **Automated Insights**: Get AI-generated insights about candidates and job matches
- **Smart Candidate Ranking**: AI ranks candidates by fit score
- **Resume Red Flags Detection**: Identify potential issues in resumes
- **Salary Prediction**: AI estimates market salary based on role and location
- **Cultural Fit Analysis**: Assess cultural alignment with company values
- **Automated Screening**: Pre-screen candidates automatically

### 🎨 User Interface Features

#### Modern Design
- **Gradient Headers**: Eye-catching gradient text effects throughout the application
- **Card-Based Layout**: Modern card designs with hover effects and shadows
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices
- **Smooth Animations**: Subtle animations and transitions for better user experience
- **Dark/Light Theme Support**: Built on Fluent UI design system with theme support

#### User Experience
- **Intuitive Navigation**: Sidebar navigation with clear icons and labels
- **Drag & Drop**: Easy file upload with drag-and-drop functionality
- **Loading States**: Clear loading indicators during AI processing
- **Error Handling**: User-friendly error messages with actionable feedback
- **Empty States**: Helpful empty states with icons and guidance
- **Status Indicators**: Color-coded badges for quick status recognition

### 🔧 Technical Features

#### Backend Architecture
- **Azure Functions**: Serverless backend built with C# .NET 8
- **RESTful API**: Clean, well-structured REST API endpoints
- **File Processing**: Server-side file parsing for PDF, DOCX, and text files
- **Error Handling**: Comprehensive error handling with fallback mechanisms
- **Logging**: Detailed logging for debugging and monitoring

#### AI Integration
- **Service Abstraction**: Clean abstraction layer for multiple AI providers
- **Factory Pattern**: Easy switching between AI providers
- **Structured Responses**: JSON-formatted AI responses for easy parsing
- **Error Recovery**: Automatic fallback to secondary AI provider
- **Cost Optimization**: Use local Ollama for development, OpenAI for production

#### Security & Compliance
- **Secure File Handling**: Files processed securely on the server
- **Data Privacy**: GDPR-compliant data handling
- **Input Validation**: Comprehensive input validation and sanitization
- **Secure Storage**: Encrypted storage for sensitive candidate data
- **Audit Logging**: Complete audit trail for all operations

#### DevOps & Deployment
- **CI/CD Pipelines**: Automated build and deployment pipelines
- **Infrastructure as Code**: Bicep templates for Azure resource provisioning
- **Testing Framework**: Unit, integration, and E2E test structure
- **Security Scanning**: Automated security vulnerability scanning
- **Multi-Environment Support**: Development, staging, and production environments

### 📊 Analytics Features

#### Dashboard Metrics
- **Total Candidates**: Track total number of candidates in the system
- **Active Candidates**: Monitor currently active candidates
- **AI Processed**: Count of resumes processed by AI
- **Time to Hire**: Average time from application to hire
- **Monthly Trends**: Track new candidates added each month

#### Pipeline Analytics
- **Recruitment Funnel**: Visual representation of candidates at each stage:
  - Sourced
  - Screening
  - Interview
  - Offer
  - Hired
- **Conversion Rates**: Track conversion rates between stages
- **Bottleneck Identification**: Identify stages with high drop-off rates

#### Performance Metrics
- **Response Time**: Average response time to candidates
- **Processing Rate**: Percentage of resumes processed by AI
- **Interview Metrics**: Interview to offer conversion rates
- **Offer Metrics**: Offer acceptance rates
- **Efficiency Metrics**: Time saved through AI automation

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React + TypeScript + Fluent UI                           │  │
│  │  - Candidate Management Dashboard                         │  │
│  │  - Job Posting & Application Tracking                     │  │
│  │  - Interview Scheduling & Calendar                        │  │
│  │  - Analytics & Reporting (Power BI Integration)           │  │
│  │  - PCF Components (PowerApps Component Framework)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Azure API Management / Application Gateway              │  │
│  │  - Authentication & Authorization (Azure AD B2C)         │  │
│  │  - Rate Limiting & Throttling                            │  │
│  │  - Request/Response Transformation                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Azure       │    │  Azure       │    │  Azure       │
│  Functions   │    │  Logic Apps  │    │  Service Bus │
│  (C# .NET)   │    │  (Orchestr.) │    │  (Messaging) │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Integration Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Service Abstraction Layer                            │  │
│  │  ┌──────────────┐              ┌──────────────┐          │  │
│  │  │   OpenAI     │              │   Ollama     │          │  │
│  │  │  (Production)│              │  (Local Dev) │          │  │
│  │  └──────────────┘              └──────────────┘          │  │
│  │                                                           │  │
│  │  AI Capabilities:                                         │  │
│  │  - CV/Resume Parsing & Extraction                         │  │
│  │  - Candidate Matching & Scoring                           │  │
│  │  - Automated Interview Question Generation                │  │
│  │  - Sentiment Analysis (Cover Letters)                     │  │
│  │  - Job Description Optimization                           │  │
│  │  - Automated Email Responses                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Dataverse (CDS) / Azure SQL Database                     │  │
│  │  - Candidate Profiles                                     │  │
│  │  - Job Postings & Applications                            │  │
│  │  - Interview Records                                      │  │
│  │  - Activity Logs & Audit Trail                            │  │
│  │  - Security Roles & Relationships                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Azure Blob Storage                                      │  │
│  │  - CV/Resume Documents                                   │  │
│  │  - Cover Letters                                         │  │
│  │  - Interview Recordings (if applicable)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Azure Cosmos DB (Optional - for high-scale scenarios)   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Integration Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  External Integrations                                   │  │
│  │  - Job Boards (LinkedIn, Indeed, etc.)                   │  │
│  │  - Email Services (SendGrid, Office 365)                 │  │
│  │  - Calendar Services (Microsoft Graph)                   │  │
│  │  - Background Check Services                             │  │
│  │  - HRIS Systems                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Fluent UI** (Microsoft's design system)
- **PowerApps Component Framework (PCF)** for Dynamics 365 integration
- **React Query** for data fetching and caching
- **Zustand** or **Redux Toolkit** for state management

### Backend
- **Azure Functions** (C# .NET 8)
- **Azure Logic Apps** for workflow orchestration
- **Azure Service Bus** for asynchronous messaging
- **ASP.NET Core** for additional API endpoints if needed

### Data & Storage
- **Dataverse (Common Data Service)** for primary data storage
- **Azure SQL Database** for relational data
- **Azure Blob Storage** for document storage
- **Azure Cosmos DB** (optional, for high-scale scenarios)

### AI & Machine Learning
- **OpenAI API** (GPT-4, GPT-3.5-turbo) - Primary for production
- **Ollama** (Local LLM) - For development and cost-sensitive scenarios
- **Azure AI Services** (Form Recognizer, Text Analytics, etc.)

### DevOps & Security
- **Azure DevOps** for CI/CD pipelines
- **GitHub Actions** (alternative CI/CD)
- **Azure Key Vault** for secrets management
- **Azure Application Insights** for monitoring
- **SonarQube** or **Azure DevOps Security Scanner** for code analysis

### Testing
- **xUnit** for unit testing (C#)
- **Jest** + **React Testing Library** for frontend testing
- **Playwright** or **Cypress** for E2E testing
- **Postman** / **Newman** for API testing

## AI Model Recommendation

### Primary: OpenAI (Production)
**Recommended for:**
- Production environments
- High accuracy requirements
- Advanced language understanding
- Multi-language support
- Reliable API with SLA

**Use Cases:**
- CV/Resume parsing and extraction
- Candidate-job matching with high precision
- Interview question generation
- Professional email composition
- Multi-language candidate processing

### Secondary: Ollama (Development/Local)
**Recommended for:**
- Local development
- Cost-sensitive scenarios
- Data privacy requirements (on-premise)
- Offline capabilities
- Testing and prototyping

**Use Cases:**
- Development and testing
- Staging environments with limited budget
- Organizations with strict data residency requirements
- Custom fine-tuned models for specific recruitment domains

**Implementation Strategy:**
The system will support both models through an abstraction layer, allowing seamless switching based on environment configuration.

## DevSecOps Pipeline

### CI/CD Pipeline Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Developer Workflow                           │
│                                                                      │
│  [Local Development] → [Git Commit] → [Feature Branch]              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Continuous Integration (CI)                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Trigger: Pull Request / Push to Feature Branch             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│        ┌───────────────────┼───────────────────┐                    │
│        │                   │                   │                    │
│        ▼                   ▼                   ▼                    │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐                  │
│  │   Code   │      │  Secret  │      │   SAST   │                  │
│  │  Quality │      │ Scanning │      │  Scan    │                  │
│  │  (Lint)  │      │          │      │          │                  │
│  └──────────┘      └──────────┘      └──────────┘                  │
│        │                   │                   │                    │
│        └───────────────────┼───────────────────┘                    │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Build Stage                                                  │  │
│  │  - Restore NuGet packages                                    │  │
│  │  - Build .NET solution                                       │  │
│  │  - Build React application                                   │  │
│  │  - Run unit tests                                            │  │
│  │  - Generate code coverage report                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Security Scanning                                            │  │
│  │  - Dependency vulnerability scan (OWASP, Snyk)               │  │
│  │  - Container image scanning (if applicable)                  │  │
│  │  - Infrastructure as Code scanning (Terraform/Bicep)        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Test Stage                                                   │  │
│  │  - Unit Tests (xUnit, Jest)                                  │  │
│  │  - Integration Tests                                         │  │
│  │  - API Tests (Postman/Newman)                                │  │
│  │  - Frontend Component Tests                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Quality Gates                                                │  │
│  │  - Code coverage threshold (≥80%)                            │  │
│  │  - No critical security vulnerabilities                      │  │
│  │  - All tests passing                                         │  │
│  │  - Code review approval required                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Artifact Generation                                          │  │
│  │  - Package .NET assemblies                                   │  │
│  │  - Build React production bundle                             │  │
│  │  - Create Docker images (if applicable)                      │  │
│  │  - Publish to Azure Artifacts                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Continuous Deployment (CD)                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Trigger: Merge to Main Branch                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Pre-Deployment                                               │  │
│  │  - Backup production database                                 │  │
│  │  - Validate infrastructure changes                            │  │
│  │  - Run smoke tests                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Deploy to Staging Environment                                │  │
│  │  - Deploy Azure Functions                                     │  │
│  │  - Deploy React app to Azure Static Web Apps                 │  │
│  │  - Update Dataverse solutions                                 │  │
│  │  - Configure environment variables                           │  │
│  │  - Run E2E tests against staging                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Security & Compliance Checks                                 │  │
│  │  - Penetration testing (automated)                            │  │
│  │  - GDPR compliance validation                                │  │
│  │  - Data privacy impact assessment                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Approval Gate (Manual)                                      │  │
│  │  - Stakeholder approval required                             │  │
│  │  - Business sign-off                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Deploy to Production Environment                             │  │
│  │  - Blue-Green deployment strategy                            │  │
│  │  - Gradual rollout (canary deployment)                       │  │
│  │  - Health checks and monitoring                              │  │
│  │  - Automatic rollback on failure                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                            │                                         │
│                            ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Post-Deployment                                              │  │
│  │  - Smoke tests in production                                 │  │
│  │  - Monitor application insights                              │  │
│  │  - Verify AI service connectivity                            │  │
│  │  - Notify stakeholders                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Monitoring & Observability                        │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Application │  │  Azure       │  │  Log          │            │
│  │  Insights    │  │  Monitor     │  │  Analytics    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                      │
│  - Real-time performance metrics                                    │
│  - Error tracking and alerting                                      │
│  - User activity analytics                                          │
│  - AI service usage and costs                                       │
│  - Security event logging                                           │
└─────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
Recruitment_CRM_ATS/
├── src/
│   ├── frontend/                    # React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/          # Reusable UI components
│   │   │   ├── pages/               # Page components
│   │   │   ├── services/            # API service layer
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── store/               # State management
│   │   │   ├── utils/               # Utility functions
│   │   │   └── types/               # TypeScript type definitions
│   │   ├── pcf-components/          # PowerApps Component Framework components
│   │   └── package.json
│   │
│   ├── backend/                     # Azure Functions (C#)
│   │   ├── Functions/
│   │   │   ├── CandidateFunctions/  # Candidate management endpoints
│   │   │   ├── JobFunctions/       # Job posting endpoints
│   │   │   ├── AIServiceFunctions/ # AI integration endpoints
│   │   │   ├── IntegrationFunctions/# External integration endpoints
│   │   │   └── Shared/             # Shared utilities and models
│   │   └── RecruitmentCRM.sln
│   │
│   ├── ai-service/                  # AI abstraction layer
│   │   ├── Services/
│   │   │   ├── IAIService.cs       # AI service interface
│   │   │   ├── OpenAIService.cs    # OpenAI implementation
│   │   │   ├── OllamaService.cs    # Ollama implementation
│   │   │   └── AIServiceFactory.cs # Factory pattern for AI services
│   │   └── Models/                  # AI request/response models
│   │
│   └── dataverse/                   # Dataverse solution files
│       ├── Solution.xml
│       ├── Entities/                # Entity definitions
│       └── Workflows/               # Power Automate workflows
│
├── tests/
│   ├── unit/                        # Unit tests
│   ├── integration/                 # Integration tests
│   ├── e2e/                         # End-to-end tests
│   └── api/                         # API tests (Postman collections)
│
├── infrastructure/                  # Infrastructure as Code
│   ├── bicep/                       # Azure Bicep templates
│   ├── terraform/                   # Terraform configurations (optional)
│   └── arm/                         # ARM templates (if needed)
│
├── pipelines/                       # CI/CD pipeline definitions
│   ├── azure-devops/                # Azure DevOps YAML pipelines
│   └── github-actions/              # GitHub Actions workflows
│
├── docs/                            # Documentation
│   ├── architecture/                # Architecture diagrams
│   ├── api/                         # API documentation
│   └── deployment/                  # Deployment guides
│
├── scripts/                         # Utility scripts
│   ├── deployment/                  # Deployment scripts
│   └── database/                    # Database migration scripts
│
├── .github/                         # GitHub configuration
│   └── workflows/                   # GitHub Actions workflows
│
├── .azuredevops/                    # Azure DevOps configuration
│
├── .env.example                     # Environment variable template
├── .gitignore
├── README.md
└── LICENSE
```

## Security Considerations

### Data Protection
- **Encryption at Rest**: All data stored in Azure services encrypted by default
- **Encryption in Transit**: TLS 1.3 for all communications
- **PII Handling**: GDPR-compliant data processing and storage
- **Access Control**: Role-based access control (RBAC) with Azure AD

### Secure Coding Practices
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection in frontend
- CSRF tokens for state-changing operations
- Secure API authentication (OAuth 2.0, JWT)

### Compliance
- GDPR compliance for EU candidates
- Data retention policies
- Audit logging for all data access
- Right to be forgotten implementation

## Deployment Environments

1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live production environment

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- .NET 8 SDK (optional - mock backend available)
- Azure CLI (for deployment)
- Azure Functions Core Tools (for .NET backend)
- Git
- Ollama (for AI services) - Optional, OpenAI can be used as fallback

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Recruitment_CRM_ATS
   ```

2. **Start the Mock Backend** (if .NET SDK not available)
   ```bash
   cd src/backend-mock
   npm install
   npm start
   ```
   Backend will run on http://localhost:7071

3. **Start the Frontend**
   ```bash
   cd src/frontend
   npm install
   npm run dev
   ```
   Frontend will run on http://localhost:3000

4. **Access the Application**
   - Open http://localhost:3000
   - Login with: `admin@recruitmentcrm.com` / any password (demo mode)
   - Or register a new account

### Quick Build Script
```bash
./scripts/build-and-launch.sh
```

## Current Status

### ✅ Completed (Production Ready - 70%)
- Complete database schema with migrations
- Full authentication system (login/register/roles)
- Complete CRUD for Candidates, Jobs, Applications
- AI-powered resume parsing (Ollama + OpenAI fallback)
- Analytics dashboard with charts and graphs
- 30 sample candidates for testing
- Modern UI with dark mode
- Toast notifications
- Search and filtering
- Security and monitoring placeholders

### ⚠️ Production Tasks Remaining
See `PRODUCTION_READINESS.md` for detailed checklist:
- Database connection (Azure SQL/Dataverse)
- File storage (Azure Blob)
- Email service (SendGrid)
- Calendar integration (Office365/Google)
- Security hardening
- Monitoring setup (Application Insights)
- Complete testing suite

## Documentation

- **README.md** - This file (overview and architecture)
- **PRODUCTION_READINESS.md** - Detailed production checklist
- **TODO_CHECKLIST.md** - Complete task breakdown
- **FEATURE_ROADMAP.md** - Future feature suggestions
- **BUILD_STATUS.md** - Build and launch instructions

## Contributing
Contributions welcome! Please see the contributing guidelines (to be added).

## License
(To be defined)

