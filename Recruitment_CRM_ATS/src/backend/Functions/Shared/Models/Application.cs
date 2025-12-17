namespace Functions.Shared.Models;

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CandidateId { get; set; }
    public Guid JobId { get; set; }
    public string Status { get; set; } = "Applied";
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? InterviewDate { get; set; }
    public string? InterviewNotes { get; set; }
    public int? MatchScore { get; set; }
    public string? CoverLetter { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? RejectedAt { get; set; }
    public DateTime? HiredAt { get; set; }
    public string? Source { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

