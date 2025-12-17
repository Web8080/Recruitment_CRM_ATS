using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.JobFunctions;

public class DeleteJobFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public DeleteJobFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<DeleteJobFunction>();
    }

    [Function("DeleteJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "jobs/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("DeleteJob function processed a request for {JobId}.", id);

        if (!Guid.TryParse(id, out var jobId))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid job ID" }));
            badResponse.Headers.Add("Content-Type", "application/json");
            return badResponse;
        }

        try
        {
            var deleted = await _databaseService.DeleteJobAsync(jobId);

            if (!deleted)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                notFoundResponse.WriteString(JsonSerializer.Serialize(new { error = "Job not found" }));
                notFoundResponse.Headers.Add("Content-Type", "application/json");
                return notFoundResponse;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(new { message = "Job deleted successfully" }));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting job {JobId}", jobId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}
