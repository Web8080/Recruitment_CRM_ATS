using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;
using Functions.Shared.Models;

namespace Functions.CandidateFunctions;

public class CreateCandidateFunction
{
    private readonly ILogger _logger;
    private readonly IDatabaseService _databaseService;

    public CreateCandidateFunction(ILoggerFactory loggerFactory, IDatabaseService databaseService)
    {
        _logger = loggerFactory.CreateLogger<CreateCandidateFunction>();
        _databaseService = databaseService;
    }

    [Function("CreateCandidate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "candidates")] HttpRequestData req)
    {
        _logger.LogInformation("CreateCandidate function processed a request.");

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var candidateRequest = JsonSerializer.Deserialize<CandidateRequest>(requestBody);

            if (candidateRequest == null || 
                string.IsNullOrEmpty(candidateRequest.FirstName) ||
                string.IsNullOrEmpty(candidateRequest.LastName) ||
                string.IsNullOrEmpty(candidateRequest.Email))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "FirstName, LastName, and Email are required" }));
                return badResponse;
            }

            // PLACEHOLDER: Get user ID from JWT token
            var userId = Guid.Parse("00000000-0000-0000-0000-000000000001");

            var candidate = new Candidate
            {
                FirstName = candidateRequest.FirstName,
                LastName = candidateRequest.LastName,
                Email = candidateRequest.Email,
                Phone = candidateRequest.Phone,
                Status = "Active",
                Skills = candidateRequest.Skills,
                Experience = candidateRequest.Experience,
                Education = candidateRequest.Education,
                Summary = candidateRequest.Summary,
                ResumeUrl = candidateRequest.ResumeUrl,
                CreatedBy = userId
            };

            var createdCandidate = await _databaseService.CreateCandidateAsync(candidate);

            var response = req.CreateResponse(HttpStatusCode.Created);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");

            var candidateDto = new
            {
                id = createdCandidate.Id,
                firstName = createdCandidate.FirstName,
                lastName = createdCandidate.LastName,
                email = createdCandidate.Email,
                phone = createdCandidate.Phone,
                status = createdCandidate.Status,
                createdAt = createdCandidate.CreatedAt
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(candidateDto));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating candidate");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = ex.Message }));
            return errorResponse;
        }
    }
}

public class CandidateRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Skills { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? Summary { get; set; }
    public string? ResumeUrl { get; set; }
}

