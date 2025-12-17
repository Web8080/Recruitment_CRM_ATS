using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Models;
using Functions.Shared.Services;

namespace Functions.ApplicationFunctions;

public class UpdateApplicationFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public UpdateApplicationFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<UpdateApplicationFunction>();
    }

    [Function("UpdateApplication")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "applications/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("UpdateApplication function processed a request for {ApplicationId}.", id);

        if (!Guid.TryParse(id, out var applicationId))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid application ID" }));
            badResponse.Headers.Add("Content-Type", "application/json");
            return badResponse;
        }

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var applicationRequest = JsonSerializer.Deserialize<ApplicationRequest>(requestBody);

            if (applicationRequest == null)
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid application data" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var existingApplication = await _databaseService.GetApplicationByIdAsync(applicationId);
            if (existingApplication == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                notFoundResponse.WriteString(JsonSerializer.Serialize(new { error = "Application not found" }));
                notFoundResponse.Headers.Add("Content-Type", "application/json");
                return notFoundResponse;
            }

            if (!string.IsNullOrEmpty(applicationRequest.Status))
                existingApplication.Status = applicationRequest.Status;
            existingApplication.InterviewDate = applicationRequest.InterviewDate;
            existingApplication.InterviewNotes = applicationRequest.InterviewNotes;
            if (applicationRequest.MatchScore.HasValue)
                existingApplication.MatchScore = applicationRequest.MatchScore;

            var updatedApplication = await _databaseService.UpdateApplicationAsync(applicationId, existingApplication);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(updatedApplication));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating application {ApplicationId}", applicationId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}

public class ApplicationUpdateRequest
{
    public string? Status { get; set; }
    public DateTime? InterviewDate { get; set; }
    public string? InterviewNotes { get; set; }
    public int? MatchScore { get; set; }
}
