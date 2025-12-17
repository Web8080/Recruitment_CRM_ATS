using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Models;
using Functions.Shared.Services;

namespace Functions.JobFunctions;

public class CreateJobFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public CreateJobFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<CreateJobFunction>();
    }

    [Function("CreateJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "jobs")] HttpRequestData req)
    {
        _logger.LogInformation("CreateJob function processed a request.");

        var clientIp = req.Headers.GetValues("X-Forwarded-For").FirstOrDefault() ?? "unknown";
        if (!_rateLimiting.IsAllowed($"create-job-{clientIp}", maxRequests: 50))
        {
            var rateLimitResponse = req.CreateResponse(HttpStatusCode.TooManyRequests);
            rateLimitResponse.WriteString(JsonSerializer.Serialize(new { error = "Rate limit exceeded" }));
            rateLimitResponse.Headers.Add("Content-Type", "application/json");
            return rateLimitResponse;
        }

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var jobRequest = JsonSerializer.Deserialize<JobRequest>(requestBody);

            if (jobRequest == null || string.IsNullOrEmpty(jobRequest.Title) || 
                string.IsNullOrEmpty(jobRequest.Department) || string.IsNullOrEmpty(jobRequest.Location))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "Title, Department, and Location are required" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var job = new Job
            {
                Title = jobRequest.Title,
                Department = jobRequest.Department,
                Location = jobRequest.Location,
                Status = jobRequest.Status ?? "Open",
                Description = jobRequest.Description,
                Requirements = jobRequest.Requirements,
                Responsibilities = jobRequest.Responsibilities,
                SalaryMin = jobRequest.SalaryMin,
                SalaryMax = jobRequest.SalaryMax,
                EmploymentType = jobRequest.EmploymentType,
                OpenPositions = jobRequest.OpenPositions ?? 1,
                PostedDate = jobRequest.PostedDate ?? DateTime.UtcNow
            };

            var createdJob = await _databaseService.CreateJobAsync(job);

            var response = req.CreateResponse(HttpStatusCode.Created);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(createdJob));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating job");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}

public class JobRequest
{
    public string Title { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Status { get; set; }
    public string? Description { get; set; }
    public string? Requirements { get; set; }
    public string? Responsibilities { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string? EmploymentType { get; set; }
    public int? OpenPositions { get; set; }
    public DateTime? PostedDate { get; set; }
}
