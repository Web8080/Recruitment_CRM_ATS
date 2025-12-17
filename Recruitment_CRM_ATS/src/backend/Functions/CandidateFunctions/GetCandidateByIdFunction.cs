using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.CandidateFunctions;

public class GetCandidateByIdFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public GetCandidateByIdFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<GetCandidateByIdFunction>();
    }

    [Function("GetCandidateById")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "candidates/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("GetCandidateById function processed a request for {CandidateId}.", id);

        if (!Guid.TryParse(id, out var candidateId))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid candidate ID" }));
            badResponse.Headers.Add("Content-Type", "application/json");
            return badResponse;
        }

        try
        {
            var candidate = await _databaseService.GetCandidateByIdAsync(candidateId);

            if (candidate == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                notFoundResponse.WriteString(JsonSerializer.Serialize(new { error = "Candidate not found" }));
                notFoundResponse.Headers.Add("Content-Type", "application/json");
                return notFoundResponse;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(candidate));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting candidate {CandidateId}", candidateId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}
