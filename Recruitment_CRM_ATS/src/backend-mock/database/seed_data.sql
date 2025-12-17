-- Seed Data: Create 30 sample candidates for analytics
-- This script populates the database with realistic test data

-- Note: In production, this would be run as part of initial setup or testing
-- For Azure SQL: Run this after schema creation
-- For Dataverse: Use Power Automate or API to create records

-- Sample candidate data with varied profiles
DECLARE @UserId UNIQUEIDENTIFIER = (SELECT TOP 1 Id FROM Users WHERE Role = 'SuperAdmin');

-- Candidates with different statuses, sources, and dates
INSERT INTO Candidates (FirstName, LastName, Email, Phone, Status, Source, CreatedById, CreatedAt)
VALUES
    ('John', 'Smith', 'john.smith@email.com', '+1-555-0101', 'Active', 'LinkedIn', @UserId, DATEADD(day, -30, GETUTCDATE())),
    ('Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0102', 'Active', 'Indeed', @UserId, DATEADD(day, -28, GETUTCDATE())),
    ('Michael', 'Williams', 'michael.williams@email.com', '+1-555-0103', 'Hired', 'Referral', @UserId, DATEADD(day, -25, GETUTCDATE())),
    ('Emily', 'Brown', 'emily.brown@email.com', '+1-555-0104', 'Active', 'LinkedIn', @UserId, DATEADD(day, -22, GETUTCDATE())),
    ('David', 'Jones', 'david.jones@email.com', '+1-555-0105', 'Interview', 'Company Website', @UserId, DATEADD(day, -20, GETUTCDATE())),
    ('Jessica', 'Garcia', 'jessica.garcia@email.com', '+1-555-0106', 'Active', 'LinkedIn', @UserId, DATEADD(day, -18, GETUTCDATE())),
    ('Christopher', 'Miller', 'christopher.miller@email.com', '+1-555-0107', 'Rejected', 'Indeed', @UserId, DATEADD(day, -15, GETUTCDATE())),
    ('Amanda', 'Davis', 'amanda.davis@email.com', '+1-555-0108', 'Active', 'Referral', @UserId, DATEADD(day, -12, GETUTCDATE())),
    ('James', 'Rodriguez', 'james.rodriguez@email.com', '+1-555-0109', 'Hired', 'LinkedIn', @UserId, DATEADD(day, -10, GETUTCDATE())),
    ('Ashley', 'Martinez', 'ashley.martinez@email.com', '+1-555-0110', 'Active', 'Indeed', @UserId, DATEADD(day, -8, GETUTCDATE())),
    ('Robert', 'Hernandez', 'robert.hernandez@email.com', '+1-555-0111', 'OnHold', 'Company Website', @UserId, DATEADD(day, -6, GETUTCDATE())),
    ('Michelle', 'Lopez', 'michelle.lopez@email.com', '+1-555-0112', 'Active', 'LinkedIn', @UserId, DATEADD(day, -5, GETUTCDATE())),
    ('Daniel', 'Wilson', 'daniel.wilson@email.com', '+1-555-0113', 'Interview', 'Referral', @UserId, DATEADD(day, -4, GETUTCDATE())),
    ('Stephanie', 'Anderson', 'stephanie.anderson@email.com', '+1-555-0114', 'Active', 'LinkedIn', @UserId, DATEADD(day, -3, GETUTCDATE())),
    ('Matthew', 'Thomas', 'matthew.thomas@email.com', '+1-555-0115', 'Hired', 'Indeed', @UserId, DATEADD(day, -2, GETUTCDATE())),
    ('Nicole', 'Taylor', 'nicole.taylor@email.com', '+1-555-0116', 'Active', 'Company Website', @UserId, DATEADD(day, -1, GETUTCDATE())),
    ('Andrew', 'Moore', 'andrew.moore@email.com', '+1-555-0117', 'Active', 'LinkedIn', @UserId, GETUTCDATE()),
    ('Lauren', 'Jackson', 'lauren.jackson@email.com', '+1-555-0118', 'Interview', 'Referral', @UserId, GETUTCDATE()),
    ('Kevin', 'White', 'kevin.white@email.com', '+1-555-0119', 'Active', 'Indeed', @UserId, GETUTCDATE()),
    ('Rachel', 'Harris', 'rachel.harris@email.com', '+1-555-0120', 'Rejected', 'LinkedIn', @UserId, GETUTCDATE()),
    ('Brian', 'Martin', 'brian.martin@email.com', '+1-555-0121', 'Active', 'Company Website', @UserId, GETUTCDATE()),
    ('Kimberly', 'Thompson', 'kimberly.thompson@email.com', '+1-555-0122', 'Hired', 'Referral', @UserId, GETUTCDATE()),
    ('Ryan', 'Garcia', 'ryan.garcia@email.com', '+1-555-0123', 'Active', 'LinkedIn', @UserId, GETUTCDATE()),
    ('Samantha', 'Martinez', 'samantha.martinez@email.com', '+1-555-0124', 'OnHold', 'Indeed', @UserId, GETUTCDATE()),
    ('Justin', 'Robinson', 'justin.robinson@email.com', '+1-555-0125', 'Active', 'LinkedIn', @UserId, GETUTCDATE()),
    ('Brittany', 'Clark', 'brittany.clark@email.com', '+1-555-0126', 'Interview', 'Company Website', @UserId, GETUTCDATE()),
    ('Brandon', 'Rodriguez', 'brandon.rodriguez@email.com', '+1-555-0127', 'Active', 'Referral', @UserId, GETUTCDATE()),
    ('Megan', 'Lewis', 'megan.lewis@email.com', '+1-555-0128', 'Hired', 'LinkedIn', @UserId, GETUTCDATE()),
    ('Tyler', 'Lee', 'tyler.lee@email.com', '+1-555-0129', 'Active', 'Indeed', @UserId, GETUTCDATE()),
    ('Amber', 'Walker', 'amber.walker@email.com', '+1-555-0130', 'Active', 'LinkedIn', @UserId, GETUTCDATE());

-- Add skills to candidates
DECLARE @CandidateIds TABLE (Id UNIQUEIDENTIFIER, RowNum INT);
INSERT INTO @CandidateIds (Id, RowNum)
SELECT Id, ROW_NUMBER() OVER (ORDER BY CreatedAt) FROM Candidates;

-- Add varied skills
INSERT INTO CandidateSkills (CandidateId, SkillName, ProficiencyLevel, YearsOfExperience)
SELECT 
    c.Id,
    CASE (ROW_NUMBER() OVER (PARTITION BY c.Id ORDER BY NEWID()) % 8)
        WHEN 0 THEN 'C#'
        WHEN 1 THEN 'JavaScript'
        WHEN 2 THEN 'Python'
        WHEN 3 THEN 'React'
        WHEN 4 THEN 'Azure'
        WHEN 5 THEN 'SQL'
        WHEN 6 THEN 'Node.js'
        ELSE 'TypeScript'
    END,
    CASE (ABS(CHECKSUM(NEWID())) % 4)
        WHEN 0 THEN 'Beginner'
        WHEN 1 THEN 'Intermediate'
        WHEN 2 THEN 'Advanced'
        ELSE 'Expert'
    END,
    ABS(CHECKSUM(NEWID())) % 10 + 1
FROM Candidates c
CROSS JOIN (SELECT 1 as n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) nums
WHERE (SELECT COUNT(*) FROM CandidateSkills WHERE CandidateId = c.Id) < 5;

-- Add experience records
INSERT INTO CandidateExperience (CandidateId, CompanyName, Position, StartDate, EndDate, IsCurrent, Description)
SELECT 
    c.Id,
    'Tech Company ' + CAST(ABS(CHECKSUM(NEWID())) % 10 + 1 AS NVARCHAR),
    CASE (ABS(CHECKSUM(NEWID())) % 5)
        WHEN 0 THEN 'Software Engineer'
        WHEN 1 THEN 'Senior Developer'
        WHEN 2 THEN 'Tech Lead'
        WHEN 3 THEN 'Full Stack Developer'
        ELSE 'DevOps Engineer'
    END,
    DATEADD(year, -(ABS(CHECKSUM(NEWID())) % 5 + 1), GETUTCDATE()),
    CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 THEN NULL ELSE DATEADD(month, -(ABS(CHECKSUM(NEWID())) % 12), GETUTCDATE()) END,
    CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 THEN 1 ELSE 0 END,
    'Responsible for developing and maintaining software applications.'
FROM Candidates c
WHERE (SELECT COUNT(*) FROM CandidateExperience WHERE CandidateId = c.Id) = 0;

-- Add education records
INSERT INTO CandidateEducation (CandidateId, Institution, Degree, FieldOfStudy, GraduationYear)
SELECT 
    c.Id,
    CASE (ABS(CHECKSUM(NEWID())) % 5)
        WHEN 0 THEN 'University of Technology'
        WHEN 1 THEN 'State University'
        WHEN 2 THEN 'Tech Institute'
        WHEN 3 THEN 'Business School'
        ELSE 'Engineering College'
    END,
    CASE (ABS(CHECKSUM(NEWID())) % 3)
        WHEN 0 THEN 'Bachelor of Science'
        WHEN 1 THEN 'Master of Science'
        ELSE 'Bachelor of Arts'
    END,
    CASE (ABS(CHECKSUM(NEWID())) % 4)
        WHEN 0 THEN 'Computer Science'
        WHEN 1 THEN 'Software Engineering'
        WHEN 2 THEN 'Information Technology'
        ELSE 'Data Science'
    END,
    2015 + (ABS(CHECKSUM(NEWID())) % 10)
FROM Candidates c
WHERE (SELECT COUNT(*) FROM CandidateEducation WHERE CandidateId = c.Id) = 0;


