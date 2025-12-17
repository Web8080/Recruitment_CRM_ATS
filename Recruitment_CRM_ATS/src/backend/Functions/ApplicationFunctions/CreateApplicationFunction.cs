using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Models;
using Functions.Shared.Services;

namespace Functions.ApplicationFunctions;

public class CreateApplicationFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public CreateApplicationFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<CreateApplicationFunction>();
    }

    [Function("CreateApplication")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "applications")] HttpRequestData req)
    {
        _logger.LogInformation("CreateApplication function processed a request.");

        var clientIp = req.Headers.GetValues("X-Forwarded-For").FirstOrDefault() ?? "unknown";
        if (!_rateLimiting.IsAllowed($"create-application-{clientIp}", maxRequests: 50))
        {
            var rateLimitResponse = req.CreateResponse(HttpStatusCode.TooManyRequests);
            rateLimitResponse.WriteString(JsonSerializer.Serialize(new { error = "Rate limit exceeded" }));
            rateLimitResponse.Headers.Add("Content-Type", "application/json");
            return rateLimitResponse;
        }

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var applicationRequest = JsonSerializer.Deserialize<ApplicationRequest>(requestBody);

            if (applicationRequest == null || applicationRequest.CandidateId == Guid.Empty || applicationRequest.JobId == Guid.Empty)
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "CandidateId and JobId are required" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var application = new Application
            {
                CandidateId = applicationRequest.CandidateId,
                JobId = applicationRequest.JobId,
                Status = applicationRequest.Status ?? "Applied",
                CoverLetter = applicationRequest.CoverLetter,
                MatchScore = applicationRequest.MatchScore,
                Source = applicationRequest.Source ?? "Manual"
            };

            var createdApplication = await _databaseService.CreateApplicationAsync(application);

            var response = req.CreateResponse(HttpStatusCode.Created);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(createdApplication));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating application");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}

public class ApplicationRequest
{
    public Guid CandidateId { get; set; }
    public Guid JobId { get; set; }
    public string? Status { get; set; }
    public string? CoverLetter { get; set; }
    public int? MatchScore { get; set; }
    public string? Source { get; set; }
}
