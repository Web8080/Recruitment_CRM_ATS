-- Seed Data for Development and Testing
-- Creates 30 sample candidates for analytics

DECLARE @Counter INT = 1;
DECLARE @Statuses TABLE (Status NVARCHAR(50));
INSERT INTO @Statuses VALUES ('Active'), ('Interviewing'), ('Offer Extended'), ('Hired'), ('Rejected'), ('On Hold');

DECLARE @Sources TABLE (Source NVARCHAR(100));
INSERT INTO @Sources VALUES ('LinkedIn'), ('Indeed'), ('Company Website'), ('Referral'), ('Job Board'), ('Direct Application');

DECLARE @Locations TABLE (Location NVARCHAR(200));
INSERT INTO @Locations VALUES ('London, UK'), ('Manchester, UK'), ('Birmingham, UK'), ('Leeds, UK'), ('Edinburgh, UK'), ('Glasgow, UK');

DECLARE @Skills TABLE (Skill NVARCHAR(100));
INSERT INTO @Skills VALUES ('C#'), ('.NET'), ('Azure'), ('SQL Server'), ('React'), ('TypeScript'), ('Power Platform'), ('Dynamics 365'), ('JavaScript'), ('Python');

WHILE @Counter <= 30
BEGIN
    DECLARE @FirstName NVARCHAR(100) = 'Candidate' + CAST(@Counter AS NVARCHAR(10));
    DECLARE @LastName NVARCHAR(100) = 'Test' + CAST(@Counter AS NVARCHAR(10));
    DECLARE @Email NVARCHAR(255) = 'candidate' + CAST(@Counter AS NVARCHAR(10)) + '@example.com';
    DECLARE @Phone NVARCHAR(20) = '+44 7' + RIGHT('00000000' + CAST(@Counter AS NVARCHAR(10)), 9);
    DECLARE @Status NVARCHAR(50) = (SELECT TOP 1 Status FROM @Statuses ORDER BY NEWID());
    DECLARE @Source NVARCHAR(100) = (SELECT TOP 1 Source FROM @Sources ORDER BY NEWID());
    DECLARE @Location NVARCHAR(200) = (SELECT TOP 1 Location FROM @Locations ORDER BY NEWID());
    DECLARE @YearsExp INT = 2 + (@Counter % 15);
    DECLARE @CreatedDate DATETIME2 = DATEADD(DAY, -(@Counter % 90), GETUTCDATE());
    
    INSERT INTO Candidates (
        FirstName, LastName, Email, Phone, Status, Source, Location,
        YearsOfExperience, CreatedAt, UpdatedAt, Skills, Summary
    )
    VALUES (
        @FirstName,
        @LastName,
        @Email,
        @Phone,
        @Status,
        @Source,
        @Location,
        @YearsExp,
        @CreatedDate,
        @CreatedDate,
        '["C#", ".NET", "Azure", "SQL Server"]',
        'Experienced software developer with ' + CAST(@YearsExp AS NVARCHAR(10)) + ' years in enterprise applications.'
    );
    
    SET @Counter = @Counter + 1;
END;

-- Create sample jobs
INSERT INTO Jobs (Title, Department, Location, Status, Description, Requirements, PostedDate, OpenPositions)
VALUES
('Senior .NET Developer', 'Engineering', 'London, UK', 'Open', 'Looking for experienced .NET developer', '5+ years C#, Azure experience', DATEADD(DAY, -30, GETUTCDATE()), 2),
('Power Platform Developer', 'IT', 'Manchester, UK', 'Open', 'Power Platform specialist needed', 'Power Apps, Power Automate, Dataverse', DATEADD(DAY, -20, GETUTCDATE()), 1),
('Dynamics 365 Consultant', 'Consulting', 'Birmingham, UK', 'Open', 'D365 implementation consultant', 'Dynamics 365, CRM, Customization', DATEADD(DAY, -15, GETUTCDATE()), 1),
('Full Stack Developer', 'Engineering', 'Leeds, UK', 'Open', 'React and .NET full stack role', 'React, TypeScript, C#, Azure', DATEADD(DAY, -10, GETUTCDATE()), 3),
('Azure Solutions Architect', 'Engineering', 'London, UK', 'Open', 'Cloud architecture role', 'Azure, Microservices, DevOps', DATEADD(DAY, -5, GETUTCDATE()), 1);

-- Create sample applications
DECLARE @JobIds TABLE (JobId UNIQUEIDENTIFIER);
INSERT INTO @JobIds SELECT TOP 5 Id FROM Jobs ORDER BY CreatedAt;

DECLARE @CandidateIds TABLE (CandidateId UNIQUEIDENTIFIER);
INSERT INTO @CandidateIds SELECT TOP 20 Id FROM Candidates ORDER BY CreatedAt;

DECLARE @AppCounter INT = 1;
WHILE @AppCounter <= 20
BEGIN
    DECLARE @CandId UNIQUEIDENTIFIER = (SELECT TOP 1 CandidateId FROM @CandidateIds ORDER BY NEWID());
    DECLARE @JobId UNIQUEIDENTIFIER = (SELECT TOP 1 JobId FROM @JobIds ORDER BY NEWID());
    DECLARE @AppStatus NVARCHAR(50) = CASE (@AppCounter % 5)
        WHEN 0 THEN 'Hired'
        WHEN 1 THEN 'Interviewing'
        WHEN 2 THEN 'Offer Extended'
        WHEN 3 THEN 'Rejected'
        ELSE 'Applied'
    END;
    DECLARE @AppliedDate DATETIME2 = DATEADD(DAY, -(@AppCounter % 30), GETUTCDATE());
    DECLARE @MatchScore INT = 60 + (@AppCounter % 40);
    
    INSERT INTO Applications (CandidateId, JobId, Status, AppliedAt, MatchScore, Source)
    VALUES (@CandId, @JobId, @AppStatus, @AppliedDate, @MatchScore, 'LinkedIn');
    
    SET @AppCounter = @AppCounter + 1;
END;

PRINT 'Seed data created: 30 candidates, 5 jobs, 20 applications';

