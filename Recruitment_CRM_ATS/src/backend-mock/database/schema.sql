-- Recruitment CRM/ATS Database Schema
-- Supports both Azure SQL Database and Dataverse (with placeholders)

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'Recruiter', -- SuperAdmin, Admin, Recruiter, Manager, Viewer
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastLoginAt DATETIME2 NULL,
    AzureADObjectId NVARCHAR(255) NULL, -- For Azure AD B2C integration
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Role (Role)
);

-- ============================================
-- CANDIDATES
-- ============================================

CREATE TABLE Candidates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20) NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Active', -- Active, Inactive, Hired, Rejected, OnHold
    CreatedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Notes NVARCHAR(MAX) NULL,
    Source NVARCHAR(100) NULL, -- LinkedIn, Indeed, Referral, etc.
    INDEX IX_Candidates_Email (Email),
    INDEX IX_Candidates_Status (Status),
    INDEX IX_Candidates_CreatedAt (CreatedAt)
);

-- ============================================
-- CANDIDATE SKILLS
-- ============================================

CREATE TABLE CandidateSkills (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Candidates(Id) ON DELETE CASCADE,
    SkillName NVARCHAR(100) NOT NULL,
    ProficiencyLevel NVARCHAR(50) NULL, -- Beginner, Intermediate, Advanced, Expert
    YearsOfExperience INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_CandidateSkills_CandidateId (CandidateId),
    INDEX IX_CandidateSkills_SkillName (SkillName)
);

-- ============================================
-- CANDIDATE EXPERIENCE
-- ============================================

CREATE TABLE CandidateExperience (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Candidates(Id) ON DELETE CASCADE,
    CompanyName NVARCHAR(200) NOT NULL,
    Position NVARCHAR(200) NOT NULL,
    StartDate DATE NULL,
    EndDate DATE NULL,
    IsCurrent BIT NOT NULL DEFAULT 0,
    Description NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_CandidateExperience_CandidateId (CandidateId)
);

-- ============================================
-- CANDIDATE EDUCATION
-- ============================================

CREATE TABLE CandidateEducation (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Candidates(Id) ON DELETE CASCADE,
    Institution NVARCHAR(200) NOT NULL,
    Degree NVARCHAR(200) NOT NULL,
    FieldOfStudy NVARCHAR(200) NULL,
    GraduationYear INT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_CandidateEducation_CandidateId (CandidateId)
);

-- ============================================
-- RESUME DOCUMENTS
-- ============================================

CREATE TABLE ResumeDocuments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Candidates(Id) ON DELETE CASCADE,
    FileName NVARCHAR(255) NOT NULL,
    FileType NVARCHAR(50) NOT NULL, -- PDF, DOCX, DOC, TXT
    FileSize BIGINT NOT NULL,
    AzureBlobUrl NVARCHAR(500) NULL, -- Placeholder for Azure Blob Storage URL
    AzureBlobContainer NVARCHAR(100) NULL,
    AzureBlobPath NVARCHAR(255) NULL,
    UploadedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsPrimary BIT NOT NULL DEFAULT 1,
    Version INT NOT NULL DEFAULT 1,
    ParsedData NVARCHAR(MAX) NULL, -- JSON of parsed resume data
    INDEX IX_ResumeDocuments_CandidateId (CandidateId),
    INDEX IX_ResumeDocuments_UploadedAt (UploadedAt)
);

-- ============================================
-- JOBS
-- ============================================

CREATE TABLE Jobs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    Department NVARCHAR(100) NULL,
    Location NVARCHAR(200) NULL,
    JobType NVARCHAR(50) NULL, -- Full-time, Part-time, Contract, Remote
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Open, Closed, OnHold
    Description NVARCHAR(MAX) NULL,
    Requirements NVARCHAR(MAX) NULL,
    SalaryRangeMin DECIMAL(18,2) NULL,
    SalaryRangeMax DECIMAL(18,2) NULL,
    CreatedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PostedAt DATETIME2 NULL,
    ClosedAt DATETIME2 NULL,
    INDEX IX_Jobs_Status (Status),
    INDEX IX_Jobs_CreatedAt (CreatedAt)
);

-- ============================================
-- JOB REQUIREMENTS/SKILLS
-- ============================================

CREATE TABLE JobRequirements (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    JobId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Jobs(Id) ON DELETE CASCADE,
    RequirementType NVARCHAR(50) NOT NULL, -- Skill, Experience, Education, Certification
    RequirementValue NVARCHAR(200) NOT NULL,
    IsRequired BIT NOT NULL DEFAULT 1,
    Priority INT NULL, -- 1 = High, 2 = Medium, 3 = Low
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_JobRequirements_JobId (JobId)
);

-- ============================================
-- APPLICATIONS
-- ============================================

CREATE TABLE Applications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CandidateId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Candidates(Id),
    JobId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Jobs(Id),
    Status NVARCHAR(50) NOT NULL DEFAULT 'Applied', -- Applied, Screening, Interview, Offer, Hired, Rejected, Withdrawn
    AppliedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    Source NVARCHAR(100) NULL,
    Notes NVARCHAR(MAX) NULL,
    MatchScore DECIMAL(5,2) NULL, -- AI-generated match score 0-100
    CreatedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Applications_CandidateId (CandidateId),
    INDEX IX_Applications_JobId (JobId),
    INDEX IX_Applications_Status (Status),
    INDEX IX_Applications_AppliedAt (AppliedAt),
    UNIQUE (CandidateId, JobId) -- Prevent duplicate applications
);

-- ============================================
-- INTERVIEWS
-- ============================================

CREATE TABLE Interviews (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ApplicationId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Applications(Id) ON DELETE CASCADE,
    InterviewType NVARCHAR(50) NOT NULL, -- Phone, Video, InPerson, Panel
    ScheduledAt DATETIME2 NOT NULL,
    DurationMinutes INT NULL,
    InterviewerId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    Location NVARCHAR(500) NULL,
    VideoLink NVARCHAR(500) NULL, -- Zoom, Teams, Google Meet link
    Office365CalendarEventId NVARCHAR(255) NULL, -- Placeholder for Office365 integration
    GoogleCalendarEventId NVARCHAR(255) NULL, -- Placeholder for Google Calendar backup
    Status NVARCHAR(50) NOT NULL DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled, NoShow
    Notes NVARCHAR(MAX) NULL,
    Rating INT NULL, -- 1-5 rating
    Feedback NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Interviews_ApplicationId (ApplicationId),
    INDEX IX_Interviews_ScheduledAt (ScheduledAt),
    INDEX IX_Interviews_Status (Status)
);

-- ============================================
-- ACTIVITY LOG
-- ============================================

CREATE TABLE ActivityLog (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EntityType NVARCHAR(50) NOT NULL, -- Candidate, Job, Application, Interview
    EntityId UNIQUEIDENTIFIER NOT NULL,
    ActivityType NVARCHAR(50) NOT NULL, -- Created, Updated, Deleted, StatusChanged, EmailSent, etc.
    Description NVARCHAR(MAX) NULL,
    UserId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    Metadata NVARCHAR(MAX) NULL, -- JSON for additional data
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_ActivityLog_EntityType_EntityId (EntityType, EntityId),
    INDEX IX_ActivityLog_CreatedAt (CreatedAt),
    INDEX IX_ActivityLog_UserId (UserId)
);

-- ============================================
-- NOTES & COMMENTS
-- ============================================

CREATE TABLE Notes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EntityType NVARCHAR(50) NOT NULL, -- Candidate, Job, Application
    EntityId UNIQUEIDENTIFIER NOT NULL,
    NoteText NVARCHAR(MAX) NOT NULL,
    IsPrivate BIT NOT NULL DEFAULT 0,
    CreatedById UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Notes_EntityType_EntityId (EntityType, EntityId),
    INDEX IX_Notes_CreatedAt (CreatedAt)
);

-- ============================================
-- EMAIL TEMPLATES
-- ============================================

CREATE TABLE EmailTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    TemplateType NVARCHAR(50) NOT NULL, -- ApplicationReceived, InterviewScheduled, Rejection, Offer, etc.
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================
-- EMAIL LOG
-- ============================================

CREATE TABLE EmailLog (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ToEmail NVARCHAR(255) NOT NULL,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX) NULL,
    TemplateId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES EmailTemplates(Id),
    Status NVARCHAR(50) NOT NULL, -- Sent, Failed, Pending, Bounced
    SentAt DATETIME2 NULL,
    OpenedAt DATETIME2 NULL,
    ClickedAt DATETIME2 NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    CreatedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_EmailLog_ToEmail (ToEmail),
    INDEX IX_EmailLog_Status (Status),
    INDEX IX_EmailLog_CreatedAt (CreatedAt)
);

-- ============================================
-- AUDIT LOG (Security & Compliance)
-- ============================================

CREATE TABLE AuditLog (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    Action NVARCHAR(100) NOT NULL, -- Login, Logout, Create, Update, Delete, View, Export
    EntityType NVARCHAR(50) NULL,
    EntityId UNIQUEIDENTIFIER NULL,
    IpAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    RequestData NVARCHAR(MAX) NULL, -- JSON
    ResponseStatus INT NULL,
    ErrorMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_AuditLog_UserId (UserId),
    INDEX IX_AuditLog_CreatedAt (CreatedAt),
    INDEX IX_AuditLog_Action (Action)
);

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE SystemSettings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SettingKey NVARCHAR(100) NOT NULL UNIQUE,
    SettingValue NVARCHAR(MAX) NULL,
    SettingType NVARCHAR(50) NULL, -- String, Number, Boolean, JSON
    Description NVARCHAR(500) NULL,
    UpdatedById UNIQUEIDENTIFIER NULL FOREIGN KEY REFERENCES Users(Id),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create Super Admin user (password: Admin123! - should be changed in production)
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, Role, IsActive)
VALUES ('admin@recruitmentcrm.com', '$2a$10$PlaceholderHashForAdmin123!', 'Super', 'Admin', 'SuperAdmin', 1);

-- Insert system settings
INSERT INTO SystemSettings (SettingKey, SettingValue, SettingType, Description)
VALUES 
    ('AzureBlobStorageEnabled', 'false', 'Boolean', 'Enable Azure Blob Storage for file uploads'),
    ('AzureBlobConnectionString', '', 'String', 'Azure Blob Storage connection string'),
    ('AzureBlobContainerName', 'resumes', 'String', 'Default container name for resumes'),
    ('Office365CalendarEnabled', 'false', 'Boolean', 'Enable Office365 calendar integration'),
    ('GoogleCalendarEnabled', 'false', 'Boolean', 'Enable Google Calendar integration'),
    ('EmailServiceEnabled', 'false', 'Boolean', 'Enable email automation'),
    ('SendGridApiKey', '', 'String', 'SendGrid API key for email service'),
    ('ApplicationInsightsEnabled', 'true', 'Boolean', 'Enable Azure Application Insights'),
    ('ApplicationInsightsConnectionString', '', 'String', 'Application Insights connection string'),
    ('RateLimitPerMinute', '100', 'Number', 'API rate limit per minute per user'),
    ('SessionTimeoutMinutes', '60', 'Number', 'User session timeout in minutes');


