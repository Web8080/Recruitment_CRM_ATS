using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.CandidateFunctions;

public class GetCandidatesFunction
{
    private readonly ILogger _logger;
    private readonly IDatabaseService _databaseService;

    public GetCandidatesFunction(ILoggerFactory loggerFactory, IDatabaseService databaseService)
    {
        _logger = loggerFactory.CreateLogger<GetCandidatesFunction>();
        _databaseService = databaseService;
    }

    [Function("GetCandidates")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "candidates")] HttpRequestData req)
    {
        _logger.LogInformation("GetCandidates function processed a request.");

        try
        {
            var searchTerm = req.Query["search"];
            var candidates = string.IsNullOrEmpty(searchTerm) 
                ? await _databaseService.GetCandidatesAsync()
                : await _databaseService.SearchCandidatesAsync(searchTerm);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");

            var candidateDtos = candidates.Select(c => new
            {
                id = c.Id,
                firstName = c.FirstName,
                lastName = c.LastName,
                email = c.Email,
                phone = c.Phone,
                status = c.Status,
                createdAt = c.CreatedAt,
                skills = c.Skills
            });

            await response.WriteStringAsync(JsonSerializer.Serialize(candidateDtos));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting candidates");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = ex.Message }));
            return errorResponse;
        }
    }
}

