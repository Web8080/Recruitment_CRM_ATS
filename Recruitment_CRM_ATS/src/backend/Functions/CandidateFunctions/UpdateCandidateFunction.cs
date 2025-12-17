using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Models;
using Functions.Shared.Services;

namespace Functions.CandidateFunctions;

public class UpdateCandidateFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public UpdateCandidateFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<UpdateCandidateFunction>();
    }

    [Function("UpdateCandidate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "candidates/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("UpdateCandidate function processed a request for {CandidateId}.", id);

        if (!Guid.TryParse(id, out var candidateId))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid candidate ID" }));
            badResponse.Headers.Add("Content-Type", "application/json");
            return badResponse;
        }

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var candidateRequest = JsonSerializer.Deserialize<CandidateRequest>(requestBody);

            if (candidateRequest == null)
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid candidate data" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var existingCandidate = await _databaseService.GetCandidateByIdAsync(candidateId);
            if (existingCandidate == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                notFoundResponse.WriteString(JsonSerializer.Serialize(new { error = "Candidate not found" }));
                notFoundResponse.Headers.Add("Content-Type", "application/json");
                return notFoundResponse;
            }

            existingCandidate.FirstName = candidateRequest.FirstName;
            existingCandidate.LastName = candidateRequest.LastName;
            existingCandidate.Email = candidateRequest.Email;
            existingCandidate.Phone = candidateRequest.Phone;
            if (!string.IsNullOrEmpty(candidateRequest.Status))
                existingCandidate.Status = candidateRequest.Status;
            existingCandidate.Skills = candidateRequest.Skills;
            existingCandidate.Location = candidateRequest.Location;
            existingCandidate.YearsOfExperience = candidateRequest.YearsOfExperience;
            existingCandidate.Summary = candidateRequest.Summary;

            var updatedCandidate = await _databaseService.UpdateCandidateAsync(candidateId, existingCandidate);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(updatedCandidate));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating candidate {CandidateId}", candidateId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}
