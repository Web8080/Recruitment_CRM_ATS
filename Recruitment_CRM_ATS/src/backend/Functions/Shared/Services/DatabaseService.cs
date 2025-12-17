using Functions.Shared.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Functions.Shared.Services;

public interface IDatabaseService
{
    Task<List<Candidate>> GetCandidatesAsync(string? search = null, string? status = null);
    Task<Candidate?> GetCandidateByIdAsync(Guid id);
    Task<Candidate> CreateCandidateAsync(Candidate candidate);
    Task<Candidate> UpdateCandidateAsync(Guid id, Candidate candidate);
    Task<bool> DeleteCandidateAsync(Guid id);
    
    Task<List<Job>> GetJobsAsync(string? status = null);
    Task<Job?> GetJobByIdAsync(Guid id);
    Task<Job> CreateJobAsync(Job job);
    Task<Job> UpdateJobAsync(Guid id, Job job);
    Task<bool> DeleteJobAsync(Guid id);
    
    Task<List<Application>> GetApplicationsAsync(Guid? candidateId = null, Guid? jobId = null);
    Task<Application?> GetApplicationByIdAsync(Guid id);
    Task<Application> CreateApplicationAsync(Application application);
    Task<Application> UpdateApplicationAsync(Guid id, Application application);
    Task<bool> DeleteApplicationAsync(Guid id);
    
    Task<List<User>> GetUsersAsync();
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(User user);
}

public class DatabaseService : IDatabaseService
{
    private readonly ILogger<DatabaseService> _logger;
    
    // Placeholder: In-memory storage (replace with actual database connection)
    private static List<Candidate> _candidates = new();
    private static List<Job> _jobs = new();
    private static List<Application> _applications = new();
    private static List<User> _users = new();
    
    public DatabaseService(ILogger<DatabaseService> logger)
    {
        _logger = logger;
        InitializeSampleData();
    }
    
    private void InitializeSampleData()
    {
        if (_candidates.Any()) return;
        
        // Create sample data for development
        var random = new Random();
        var statuses = new[] { "Active", "Interviewing", "Offer Extended", "Hired", "Rejected", "On Hold" };
        var sources = new[] { "LinkedIn", "Indeed", "Company Website", "Referral", "Job Board" };
        var locations = new[] { "London, UK", "Manchester, UK", "Birmingham, UK", "Leeds, UK", "Edinburgh, UK" };
        
        for (int i = 1; i <= 30; i++)
        {
            _candidates.Add(new Candidate
            {
                Id = Guid.NewGuid(),
                FirstName = $"Candidate{i}",
                LastName = $"Test{i}",
                Email = $"candidate{i}@example.com",
                Phone = $"+44 7{random.Next(100000000, 999999999)}",
                Status = statuses[random.Next(statuses.Length)],
                Source = sources[random.Next(sources.Length)],
                Location = locations[random.Next(locations.Length)],
                YearsOfExperience = 2 + (i % 15),
                CreatedAt = DateTime.UtcNow.AddDays(-(i % 90)),
                UpdatedAt = DateTime.UtcNow.AddDays(-(i % 90)),
                Skills = JsonSerializer.Serialize(new[] { "C#", ".NET", "Azure", "SQL Server" }),
                Summary = $"Experienced software developer with {2 + (i % 15)} years in enterprise applications."
            });
        }
        
        // Create sample jobs
        _jobs.AddRange(new[]
        {
            new Job { Id = Guid.NewGuid(), Title = "Senior .NET Developer", Department = "Engineering", Location = "London, UK", Status = "Open", CreatedAt = DateTime.UtcNow.AddDays(-30) },
            new Job { Id = Guid.NewGuid(), Title = "Power Platform Developer", Department = "IT", Location = "Manchester, UK", Status = "Open", CreatedAt = DateTime.UtcNow.AddDays(-20) },
            new Job { Id = Guid.NewGuid(), Title = "Dynamics 365 Consultant", Department = "Consulting", Location = "Birmingham, UK", Status = "Open", CreatedAt = DateTime.UtcNow.AddDays(-15) },
            new Job { Id = Guid.NewGuid(), Title = "Full Stack Developer", Department = "Engineering", Location = "Leeds, UK", Status = "Open", CreatedAt = DateTime.UtcNow.AddDays(-10) },
            new Job { Id = Guid.NewGuid(), Title = "Azure Solutions Architect", Department = "Engineering", Location = "London, UK", Status = "Open", CreatedAt = DateTime.UtcNow.AddDays(-5) }
        });
        
        // Create sample applications
        for (int i = 0; i < 20; i++)
        {
            var candidate = _candidates[random.Next(_candidates.Count)];
            var job = _jobs[random.Next(_jobs.Count)];
            var statuses = new[] { "Applied", "Interviewing", "Offer Extended", "Hired", "Rejected" };
            
            _applications.Add(new Application
            {
                Id = Guid.NewGuid(),
                CandidateId = candidate.Id,
                JobId = job.Id,
                Status = statuses[random.Next(statuses.Length)],
                AppliedAt = DateTime.UtcNow.AddDays(-(i % 30)),
                MatchScore = 60 + (i % 40),
                Source = "LinkedIn"
            });
        }
        
        // Create default users
        _users.Add(new User
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Email = "admin@recruitmentcrm.com",
            FirstName = "Super",
            LastName = "Admin",
            Role = "SuperAdmin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        
        _logger.LogInformation("Sample data initialized: {CandidateCount} candidates, {JobCount} jobs, {AppCount} applications", 
            _candidates.Count, _jobs.Count, _applications.Count);
    }
    
    // Candidate methods
    public Task<List<Candidate>> GetCandidatesAsync(string? search = null, string? status = null)
    {
        var query = _candidates.AsQueryable();
        
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => 
                c.FirstName.ToLower().Contains(searchLower) ||
                c.LastName.ToLower().Contains(searchLower) ||
                c.Email.ToLower().Contains(searchLower) ||
                (c.Skills != null && c.Skills.ToLower().Contains(searchLower))
            );
        }
        
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(c => c.Status == status);
        }
        
        return Task.FromResult(query.ToList());
    }
    
    public Task<Candidate?> GetCandidateByIdAsync(Guid id)
    {
        return Task.FromResult(_candidates.FirstOrDefault(c => c.Id == id));
    }
    
    public Task<Candidate> CreateCandidateAsync(Candidate candidate)
    {
        candidate.Id = Guid.NewGuid();
        candidate.CreatedAt = DateTime.UtcNow;
        candidate.UpdatedAt = DateTime.UtcNow;
        _candidates.Add(candidate);
        _logger.LogInformation("Candidate created: {CandidateId}", candidate.Id);
        return Task.FromResult(candidate);
    }
    
    public Task<Candidate> UpdateCandidateAsync(Guid id, Candidate candidate)
    {
        var existing = _candidates.FirstOrDefault(c => c.Id == id);
        if (existing == null)
            throw new KeyNotFoundException($"Candidate with id {id} not found");
        
        existing.FirstName = candidate.FirstName;
        existing.LastName = candidate.LastName;
        existing.Email = candidate.Email;
        existing.Phone = candidate.Phone;
        existing.Status = candidate.Status;
        existing.Skills = candidate.Skills;
        existing.Experience = candidate.Experience;
        existing.Education = candidate.Education;
        existing.Summary = candidate.Summary;
        existing.Location = candidate.Location;
        existing.YearsOfExperience = candidate.YearsOfExperience;
        existing.UpdatedAt = DateTime.UtcNow;
        
        _logger.LogInformation("Candidate updated: {CandidateId}", id);
        return Task.FromResult(existing);
    }
    
    public Task<bool> DeleteCandidateAsync(Guid id)
    {
        var candidate = _candidates.FirstOrDefault(c => c.Id == id);
        if (candidate == null) return Task.FromResult(false);
        
        _candidates.Remove(candidate);
        _logger.LogInformation("Candidate deleted: {CandidateId}", id);
        return Task.FromResult(true);
    }
    
    // Job methods
    public Task<List<Job>> GetJobsAsync(string? status = null)
    {
        var query = _jobs.AsQueryable();
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(j => j.Status == status);
        }
        return Task.FromResult(query.ToList());
    }
    
    public Task<Job?> GetJobByIdAsync(Guid id)
    {
        return Task.FromResult(_jobs.FirstOrDefault(j => j.Id == id));
    }
    
    public Task<Job> CreateJobAsync(Job job)
    {
        job.Id = Guid.NewGuid();
        job.CreatedAt = DateTime.UtcNow;
        job.UpdatedAt = DateTime.UtcNow;
        _jobs.Add(job);
        _logger.LogInformation("Job created: {JobId}", job.Id);
        return Task.FromResult(job);
    }
    
    public Task<Job> UpdateJobAsync(Guid id, Job job)
    {
        var existing = _jobs.FirstOrDefault(j => j.Id == id);
        if (existing == null)
            throw new KeyNotFoundException($"Job with id {id} not found");
        
        existing.Title = job.Title;
        existing.Department = job.Department;
        existing.Location = job.Location;
        existing.Status = job.Status;
        existing.Description = job.Description;
        existing.Requirements = job.Requirements;
        existing.UpdatedAt = DateTime.UtcNow;
        
        _logger.LogInformation("Job updated: {JobId}", id);
        return Task.FromResult(existing);
    }
    
    public Task<bool> DeleteJobAsync(Guid id)
    {
        var job = _jobs.FirstOrDefault(j => j.Id == id);
        if (job == null) return Task.FromResult(false);
        
        _jobs.Remove(job);
        _logger.LogInformation("Job deleted: {JobId}", id);
        return Task.FromResult(true);
    }
    
    // Application methods
    public Task<List<Application>> GetApplicationsAsync(Guid? candidateId = null, Guid? jobId = null)
    {
        var query = _applications.AsQueryable();
        if (candidateId.HasValue)
            query = query.Where(a => a.CandidateId == candidateId.Value);
        if (jobId.HasValue)
            query = query.Where(a => a.JobId == jobId.Value);
        return Task.FromResult(query.ToList());
    }
    
    public Task<Application?> GetApplicationByIdAsync(Guid id)
    {
        return Task.FromResult(_applications.FirstOrDefault(a => a.Id == id));
    }
    
    public Task<Application> CreateApplicationAsync(Application application)
    {
        application.Id = Guid.NewGuid();
        application.AppliedAt = DateTime.UtcNow;
        application.UpdatedAt = DateTime.UtcNow;
        _applications.Add(application);
        _logger.LogInformation("Application created: {ApplicationId}", application.Id);
        return Task.FromResult(application);
    }
    
    public Task<Application> UpdateApplicationAsync(Guid id, Application application)
    {
        var existing = _applications.FirstOrDefault(a => a.Id == id);
        if (existing == null)
            throw new KeyNotFoundException($"Application with id {id} not found");
        
        existing.Status = application.Status;
        existing.InterviewDate = application.InterviewDate;
        existing.InterviewNotes = application.InterviewNotes;
        existing.MatchScore = application.MatchScore;
        existing.UpdatedAt = DateTime.UtcNow;
        
        _logger.LogInformation("Application updated: {ApplicationId}", id);
        return Task.FromResult(existing);
    }
    
    public Task<bool> DeleteApplicationAsync(Guid id)
    {
        var application = _applications.FirstOrDefault(a => a.Id == id);
        if (application == null) return Task.FromResult(false);
        
        _applications.Remove(application);
        _logger.LogInformation("Application deleted: {ApplicationId}", id);
        return Task.FromResult(true);
    }
    
    // User methods
    public Task<List<User>> GetUsersAsync()
    {
        return Task.FromResult(_users.ToList());
    }
    
    public Task<User?> GetUserByEmailAsync(string email)
    {
        return Task.FromResult(_users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase)));
    }
    
    public Task<User> CreateUserAsync(User user)
    {
        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        _users.Add(user);
        _logger.LogInformation("User created: {UserId}", user.Id);
        return Task.FromResult(user);
    }
}
