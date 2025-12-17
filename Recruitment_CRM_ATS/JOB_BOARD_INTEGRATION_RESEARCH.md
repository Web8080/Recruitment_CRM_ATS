# Job Board Integration & Automation Research

## Research Summary

Based on research of modern recruitment CRM/ATS systems (Bullhorn, Greenhouse, Lever, Workday Recruiting, etc.), here are the key findings:

## 1. LinkedIn Integration

### LinkedIn Jobs API
- **LinkedIn Talent Solutions API**: Official API for posting jobs and retrieving applications
- **OAuth 2.0 Authentication**: Required for API access
- **Job Posting**: POST to `/v2/jobPostings` endpoint
- **Application Retrieval**: GET from `/v2/jobApplications`
- **Tracking**: LinkedIn provides `sourceTrackingId` parameter for tracking

### Implementation Approach
1. **OAuth Flow**: User authorizes LinkedIn access
2. **Job Posting**: Automatically post jobs when created/updated
3. **Webhook Integration**: Receive applications in real-time
4. **Source Tracking**: Use LinkedIn's tracking parameters

### Key Features
- Auto-post jobs when status changes to "Open"
- Receive applications via webhooks
- Track source with `utm_source=linkedin`
- Match LinkedIn profiles to candidates

## 2. Company Website Integration

### Tracking Code Approach
- **Unique Tracking URLs**: Generate unique URLs for each job posting
- **UTM Parameters**: Use UTM tracking (utm_source, utm_medium, utm_campaign, utm_content)
- **Embedded Forms**: Provide embeddable job application forms
- **Webhook Endpoints**: Receive form submissions via webhooks

### Implementation
1. **Generate Tracking Code**: Create unique code per job (e.g., `JOB-12345-ABC`)
2. **Embeddable Form**: Provide JavaScript snippet for company website
3. **Webhook URL**: `https://yourdomain.com/api/webhooks/job-application`
4. **Auto-tracking**: Automatically set source when application received

### Example Tracking URL
```
https://company.com/careers/apply?job_id=JOB-12345&source=company_website&tracking_code=ABC123XYZ
```

## 3. Source Tracking Algorithm

### How It Works
1. **Job Creation**: Generate unique tracking code per job
2. **URL Generation**: Create job-specific URLs for each board
3. **Application Receipt**: Parse tracking parameters from incoming applications
4. **Source Assignment**: Automatically assign source based on:
   - URL parameters (utm_source, source, tracking_code)
   - Referrer header
   - Application metadata
   - Webhook source

### Tracking Parameters
- `source`: Job board name (linkedin, indeed, company_website, etc.)
- `job_id`: Internal job ID
- `tracking_code`: Unique identifier for this posting
- `campaign_id`: Marketing campaign identifier
- `referrer`: HTTP referrer header

## 4. Automation Best Practices

### Job Posting Automation
- **Auto-post on status change**: When job status → "Open", post to selected boards
- **Auto-update**: Update postings when job details change
- **Auto-close**: Remove postings when job status → "Closed"
- **Scheduling**: Schedule postings for future dates

### Application Processing
- **Webhook Receivers**: Real-time application processing
- **Auto-parsing**: Extract candidate data from applications
- **Auto-matching**: Calculate match scores automatically
- **Auto-notifications**: Notify recruiters of new applications

### Source Analytics
- **Track effectiveness**: Which boards yield best candidates
- **Cost tracking**: Cost per application per source
- **Conversion rates**: Application → Interview → Hire by source
- **Time-to-fill**: Average time by source

## 5. Implementation Architecture

### Components Needed
1. **Job Board Manager**: UI for selecting boards, configuring integrations
2. **Tracking Code Generator**: Generate unique codes per job/board
3. **Webhook Receiver**: Handle incoming applications
4. **LinkedIn OAuth Handler**: Manage LinkedIn authentication
5. **Source Parser**: Extract source from various inputs
6. **Analytics Engine**: Track and report on source effectiveness

### Database Schema Additions
- `JobBoardIntegrations`: Store OAuth tokens, API keys
- `JobPostings`: Track job postings on external boards
- `TrackingCodes`: Store unique tracking codes
- `SourceTracking`: Log all source tracking events

## 6. Security Considerations
- **OAuth Token Storage**: Encrypt tokens in database
- **Webhook Verification**: Verify webhook signatures
- **Rate Limiting**: Respect API rate limits
- **Token Refresh**: Auto-refresh expired tokens

