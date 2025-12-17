-- Recruitment CRM/ATS Database Schema
-- Supports both Azure SQL Database and Dataverse concepts

-- Users and Authentication
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'Recruiter',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2 NULL,
    AzureAdObjectId NVARCHAR(255) NULL,
    Department NVARCHAR(100) NULL,
    PasswordHash NVARCHAR(255) NULL, -- For local auth fallback
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Role (Role)
);

-- Candidates
CREATE TABLE Candidates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ResumeUrl NVARCHAR(500) NULL, -- Azure Blob Storage URL placeholder
    Skills NVARCHAR(MAX) NULL, -- JSON array
    Experience NVARCHAR(MAX) NULL, -- JSON array
    Education NVARCHAR(MAX) NULL, -- JSON array
    Summary NVARCHAR(MAX) NULL,
    Source NVARCHAR(100) NULL,
    Location NVARCHAR(200) NULL,
    YearsOfExperience INT NULL,
    CurrentCompany NVARCHAR(200) NULL,
    CurrentPosition NVARCHAR(200) NULL,
    ExpectedSalary DECIMAL(18,2) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id),
    INDEX IX_Candidates_Email (Email),
    INDEX IX_Candidates_Status (Status),
    INDEX IX_Candidates_CreatedAt (CreatedAt),
    INDEX IX_Candidates_Source (Source)
);

-- Jobs
CREATE TABLE Jobs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    Department NVARCHAR(100) NOT NULL,
    Location NVARCHAR(200) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Open',
    Description NVARCHAR(MAX) NULL,
    Requirements NVARCHAR(MAX) NULL,
    Responsibilities NVARCHAR(MAX) NULL,
    SalaryMin DECIMAL(18,2) NULL,
    SalaryMax DECIMAL(18,2) NULL,
    EmploymentType NVARCHAR(50) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PostedDate DATETIME2 NULL,
    ClosingDate DATETIME2 NULL,
    OpenPositions INT NULL DEFAULT 1,
    HiringManager UNIQUEIDENTIFIER NULL,
    Tags NVARCHAR(500) NULL,
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (HiringManager) REFERENCES Users(Id),
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id),
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id),
    INDEX IX_Jobs_Status (Status),
    INDEX IX_Jobs_Department (Department),
    INDEX IX_Jobs_CreatedAt (CreatedAt)
);

-- Applications
CREATE TABLE Applications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL,
    JobId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Applied',
    AppliedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    InterviewDate DATETIME2 NULL,
    InterviewNotes NVARCHAR(MAX) NULL,
    MatchScore INT NULL,
    CoverLetter NVARCHAR(MAX) NULL,
    RejectionReason NVARCHAR(MAX) NULL,
    RejectedAt DATETIME2 NULL,
    HiredAt DATETIME2 NULL,
    Source NVARCHAR(100) NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE,
    FOREIGN KEY (JobId) REFERENCES Jobs(Id) ON DELETE CASCADE,
    INDEX IX_Applications_CandidateId (CandidateId),
    INDEX IX_Applications_JobId (JobId),
    INDEX IX_Applications_Status (Status),
    INDEX IX_Applications_AppliedAt (AppliedAt),
    UNIQUE (CandidateId, JobId) -- One application per candidate per job
);

-- Activity Log (Audit Trail)
CREATE TABLE ActivityLog (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL,
    EntityType NVARCHAR(50) NOT NULL, -- Candidate, Job, Application
    EntityId UNIQUEIDENTIFIER NOT NULL,
    Action NVARCHAR(50) NOT NULL, -- Create, Update, Delete, View
    Details NVARCHAR(MAX) NULL, -- JSON
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    INDEX IX_ActivityLog_EntityType_EntityId (EntityType, EntityId),
    INDEX IX_ActivityLog_CreatedAt (CreatedAt),
    INDEX IX_ActivityLog_UserId (UserId)
);

-- Email Templates
CREATE TABLE EmailTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Subject NVARCHAR(200) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    TemplateType NVARCHAR(50) NOT NULL, -- ApplicationReceived, InterviewScheduled, Rejection, Offer
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id)
);

-- Scheduled Emails
CREATE TABLE ScheduledEmails (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TemplateId UNIQUEIDENTIFIER NOT NULL,
    ToEmail NVARCHAR(255) NOT NULL,
    ToName NVARCHAR(200) NULL,
    Subject NVARCHAR(200) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    ScheduledFor DATETIME2 NOT NULL,
    SentAt DATETIME2 NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Sent, Failed
    ErrorMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (TemplateId) REFERENCES EmailTemplates(Id),
    INDEX IX_ScheduledEmails_Status (Status),
    INDEX IX_ScheduledEmails_ScheduledFor (ScheduledFor)
);

-- Calendar Events (Interview Scheduling)
CREATE TABLE CalendarEvents (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ApplicationId UNIQUEIDENTIFIER NULL,
    CandidateId UNIQUEIDENTIFIER NULL,
    JobId UNIQUEIDENTIFIER NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Location NVARCHAR(500) NULL,
    MeetingUrl NVARCHAR(500) NULL, -- For video interviews
    EventType NVARCHAR(50) NOT NULL, -- Interview, Meeting, Call
    Status NVARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
    OrganizerId UNIQUEIDENTIFIER NOT NULL,
    Attendees NVARCHAR(MAX) NULL, -- JSON array of user IDs
    Office365EventId NVARCHAR(255) NULL,
    GoogleCalendarEventId NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ApplicationId) REFERENCES Applications(Id),
    FOREIGN KEY (CandidateId) REFERENCES Candidates(Id),
    FOREIGN KEY (JobId) REFERENCES Jobs(Id),
    FOREIGN KEY (OrganizerId) REFERENCES Users(Id),
    INDEX IX_CalendarEvents_StartTime (StartTime),
    INDEX IX_CalendarEvents_Status (Status)
);

-- Resume Files (Metadata)
CREATE TABLE ResumeFiles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileSize BIGINT NOT NULL,
    MimeType NVARCHAR(100) NOT NULL,
    BlobUrl NVARCHAR(500) NULL, -- Azure Blob Storage URL placeholder
    BlobContainer NVARCHAR(100) NULL DEFAULT 'resumes',
    Version INT NOT NULL DEFAULT 1,
    IsActive BIT NOT NULL DEFAULT 1,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UploadedBy UNIQUEIDENTIFIER NULL,
    FOREIGN KEY (CandidateId) REFERENCES Candidates(Id) ON DELETE CASCADE,
    FOREIGN KEY (UploadedBy) REFERENCES Users(Id),
    INDEX IX_ResumeFiles_CandidateId (CandidateId),
    INDEX IX_ResumeFiles_IsActive (IsActive)
);

-- Initial Data: Create Super Admin User
INSERT INTO Users (Id, Email, FirstName, LastName, Role, IsActive, CreatedAt)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@recruitmentcrm.com',
    'Super',
    'Admin',
    'SuperAdmin',
    1,
    GETUTCDATE()
);

-- Sample data for testing (30 candidates)
-- This will be populated by the seed script
