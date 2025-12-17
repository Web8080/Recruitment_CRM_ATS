namespace Functions.Shared.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Recruiter";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public string? AzureAdObjectId { get; set; }
    public string? Department { get; set; }
}

public enum UserRole
{
    SuperAdmin,
    Admin,
    Recruiter,
    HiringManager,
    Interviewer,
    Viewer
}

