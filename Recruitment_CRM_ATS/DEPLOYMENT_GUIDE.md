# Deployment Guide - Recruitment CRM/ATS

## Overview

This guide provides comprehensive deployment recommendations for the Recruitment CRM/ATS system on Azure, including infrastructure setup, CI/CD pipeline configuration, and production best practices.

## Architecture Overview

### Recommended Azure Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Front Door                         │
│              (CDN, WAF, DDoS Protection)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌───────▼────────┐
│  Azure App      │          │  Azure Static   │
│  Service (API)  │          │  Web Apps       │
│  (.NET 8)       │          │  (React)         │
└───────┬─────────┘          └─────────────────┘
        │
        ├─────────────────────────────────────┐
        │                                     │
┌───────▼────────┐                  ┌─────────▼────────┐
│  Azure SQL     │                  │  Azure Blob     │
│  Database      │                  │  Storage        │
│  (Primary DB)  │                  │  (Resumes)      │
└────────────────┘                  └─────────────────┘
        │
┌───────▼────────┐
│  Azure Cache   │
│  for Redis     │
│  (Sessions)    │
└────────────────┘
```

## Infrastructure Setup

### 1. Azure Resources

#### App Service Plan
```bash
# Create App Service Plan
az appservice plan create \
  --name recruitment-crm-plan \
  --resource-group recruitment-crm-rg \
  --sku P1V2 \
  --is-linux
```

#### App Service (Backend API)
```bash
# Create App Service for API
az webapp create \
  --name recruitment-crm-api \
  --resource-group recruitment-crm-rg \
  --plan recruitment-crm-plan \
  --runtime "DOTNET|8.0"
```

#### Static Web App (Frontend)
```bash
# Create Static Web App
az staticwebapp create \
  --name recruitment-crm-web \
  --resource-group recruitment-crm-rg \
  --location "West Europe" \
  --sku Standard
```

#### Azure SQL Database
```bash
# Create SQL Server
az sql server create \
  --name recruitment-crm-sql \
  --resource-group recruitment-crm-rg \
  --location "West Europe" \
  --admin-user sqladmin \
  --admin-password <secure-password>

# Create SQL Database
az sql db create \
  --resource-group recruitment-crm-rg \
  --server recruitment-crm-sql \
  --name recruitment-crm-db \
  --service-objective S2 \
  --backup-storage-redundancy Geo
```

#### Azure Blob Storage
```bash
# Create Storage Account
az storage account create \
  --name recruitmentcrmstorage \
  --resource-group recruitment-crm-rg \
  --location "West Europe" \
  --sku Standard_LRS \
  --kind StorageV2

# Create Container
az storage container create \
  --name resumes \
  --account-name recruitmentcrmstorage \
  --public-access off
```

#### Azure Cache for Redis
```bash
# Create Redis Cache
az redis create \
  --name recruitment-crm-redis \
  --resource-group recruitment-crm-rg \
  --location "West Europe" \
  --sku Basic \
  --vm-size c0
```

#### Application Insights
```bash
# Create Application Insights
az monitor app-insights component create \
  --app recruitment-crm-insights \
  --location "West Europe" \
  --resource-group recruitment-crm-rg
```

### 2. Environment Variables

#### Backend (.NET)
```bash
# App Service Configuration
az webapp config appsettings set \
  --name recruitment-crm-api \
  --resource-group recruitment-crm-rg \
  --settings \
    "ConnectionStrings:DefaultConnection=..." \
    "Azure:Storage:ConnectionString=..." \
    "JWT:Secret=..." \
    "Ollama:BaseUrl=..." \
    "OpenAI:ApiKey=..." \
    "ApplicationInsights:ConnectionString=..."
```

#### Frontend (React)
```bash
# Static Web App Configuration
az staticwebapp appsettings set \
  --name recruitment-crm-web \
  --resource-group recruitment-crm-rg \
  --setting-names \
    "VITE_API_BASE_URL=https://recruitment-crm-api.azurewebsites.net/api" \
    "VITE_APPINSIGHTS_KEY=..."
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Backend CI/CD (`.github/workflows/backend-deploy.yml`)
```yaml
name: Backend Deploy

on:
  push:
    branches: [main]
    paths:
      - 'src/backend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      
      - name: Restore dependencies
        run: dotnet restore src/backend/
      
      - name: Build
        run: dotnet build src/backend/ --no-restore
      
      - name: Test
        run: dotnet test src/backend/ --no-build --verbosity normal
      
      - name: Publish
        run: dotnet publish src/backend/ -c Release -o ./publish
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'recruitment-crm-api'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish
```

#### Frontend CI/CD (`.github/workflows/frontend-deploy.yml`)
```yaml
name: Frontend Deploy

on:
  push:
    branches: [main]
    paths:
      - 'src/frontend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18.x'
      
      - name: Install dependencies
        run: |
          cd src/frontend
          npm ci
      
      - name: Build
        run: |
          cd src/frontend
          npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      
      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "src/frontend"
          output_location: "dist"
```

## Security Configuration

### 1. Azure Front Door + WAF

```bash
# Create Front Door with WAF
az network front-door create \
  --name recruitment-crm-fd \
  --resource-group recruitment-crm-rg \
  --backend-address recruitment-crm-api.azurewebsites.net \
  --frontend-name recruitment-crm-fe \
  --accepted-protocols Http Https

# Enable WAF
az network front-door waf-policy create \
  --name recruitment-crm-waf \
  --resource-group recruitment-crm-rg \
  --mode Prevention \
  --sku Classic_AzureFrontDoor
```

### 2. Key Vault Integration

```bash
# Create Key Vault
az keyvault create \
  --name recruitment-crm-kv \
  --resource-group recruitment-crm-rg \
  --location "West Europe" \
  --sku standard

# Store secrets
az keyvault secret set \
  --vault-name recruitment-crm-kv \
  --name "JWT-Secret" \
  --value "<secure-secret>"
```

### 3. Managed Identity

```bash
# Enable Managed Identity for App Service
az webapp identity assign \
  --name recruitment-crm-api \
  --resource-group recruitment-crm-rg

# Grant Key Vault access
az keyvault set-policy \
  --name recruitment-crm-kv \
  --object-id <managed-identity-object-id> \
  --secret-permissions get list
```

## Database Setup

### 1. Run Migrations

```bash
# Using Entity Framework Core
dotnet ef database update \
  --project src/backend/ \
  --connection "Server=..."
```

### 2. Seed Initial Data

```bash
# Run seed script
dotnet run --project src/backend/ -- seed
```

## Monitoring & Logging

### 1. Application Insights Configuration

```csharp
// In Program.cs
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddApplicationInsightsTelemetryProcessor<CustomTelemetryProcessor>();
```

### 2. Log Analytics Workspace

```bash
# Create Log Analytics Workspace
az monitor log-analytics workspace create \
  --workspace-name recruitment-crm-logs \
  --resource-group recruitment-crm-rg \
  --location "West Europe"
```

### 3. Alerts

```bash
# Create alert for high error rate
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group recruitment-crm-rg \
  --scopes /subscriptions/.../resourceGroups/.../providers/Microsoft.Web/sites/recruitment-crm-api \
  --condition "avg exceptions/server > 10" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## Backup & Disaster Recovery

### 1. Database Backups

```bash
# Configure automated backups
az sql db backup-policy set \
  --resource-group recruitment-crm-rg \
  --server recruitment-crm-sql \
  --name recruitment-crm-db \
  --retention-days 30 \
  --backup-policy-type Geo
```

### 2. Blob Storage Backup

```bash
# Enable blob versioning
az storage blob service-properties update \
  --account-name recruitmentcrmstorage \
  --enable-versioning
```

## Performance Optimization

### 1. CDN Configuration

- Enable Azure CDN for static assets
- Configure caching rules
- Enable compression

### 2. Database Optimization

- Create appropriate indexes
- Enable query store
- Configure auto-tuning

### 3. Application Optimization

- Enable response compression
- Configure caching headers
- Implement lazy loading

## Cost Optimization

### 1. Resource Sizing

- Start with lower SKUs
- Scale up based on usage
- Use reserved instances for predictable workloads

### 2. Auto-scaling

```bash
# Configure auto-scale
az monitor autoscale create \
  --name recruitment-crm-autoscale \
  --resource-group recruitment-crm-rg \
  --resource /subscriptions/.../resourceGroups/.../providers/Microsoft.Web/serverfarms/recruitment-crm-plan \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Secrets stored in Key Vault
- [ ] Monitoring configured
- [ ] Backup strategy in place

### Deployment
- [ ] Deploy infrastructure
- [ ] Run database migrations
- [ ] Deploy backend API
- [ ] Deploy frontend
- [ ] Configure CDN/WAF
- [ ] Set up monitoring
- [ ] Configure alerts

### Post-Deployment
- [ ] Verify all endpoints
- [ ] Test authentication
- [ ] Check monitoring dashboards
- [ ] Verify backups
- [ ] Performance baseline
- [ ] Security scan
- [ ] Documentation updated

## Rollback Plan

1. **Database Rollback**
   - Restore from backup
   - Run previous migration

2. **Application Rollback**
   - Deploy previous version
   - Use deployment slots for zero-downtime

3. **Configuration Rollback**
   - Revert environment variables
   - Restore previous configuration

## Maintenance

### Regular Tasks
- Weekly: Review logs and alerts
- Monthly: Security updates
- Quarterly: Performance review
- Annually: Disaster recovery drill

### Updates
- Keep dependencies updated
- Apply security patches promptly
- Test updates in staging first
- Use deployment slots for testing

## Support & Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check firewall rules
   - Verify connection string
   - Check service status

2. **Authentication Failures**
   - Verify JWT secret
   - Check token expiration
   - Review audit logs

3. **Performance Issues**
   - Check Application Insights
   - Review database queries
   - Analyze slow requests

## Conclusion

This deployment guide provides a comprehensive approach to deploying the Recruitment CRM/ATS system on Azure. Follow the checklist and best practices to ensure a secure, scalable, and maintainable deployment.

For additional support, refer to:
- Azure Documentation
- Security Audit Report
- Architecture Documentation
- README.md

