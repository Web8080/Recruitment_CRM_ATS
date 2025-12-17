using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.ApplicationFunctions;

public class GetApplicationsFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public GetApplicationsFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<GetApplicationsFunction>();
    }

    [Function("GetApplications")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "applications")] HttpRequestData req)
    {
        _logger.LogInformation("GetApplications function processed a request.");

        var clientIp = req.Headers.GetValues("X-Forwarded-For").FirstOrDefault() ?? "unknown";
        if (!_rateLimiting.IsAllowed($"applications-{clientIp}", maxRequests: 100))
        {
            var rateLimitResponse = req.CreateResponse(HttpStatusCode.TooManyRequests);
            rateLimitResponse.WriteString(JsonSerializer.Serialize(new { error = "Rate limit exceeded" }));
            rateLimitResponse.Headers.Add("Content-Type", "application/json");
            return rateLimitResponse;
        }

        try
        {
            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            Guid? candidateId = null;
            Guid? jobId = null;

            if (Guid.TryParse(queryParams["candidateId"], out var candId))
                candidateId = candId;
            if (Guid.TryParse(queryParams["jobId"], out var jId))
                jobId = jId;

            var applications = await _databaseService.GetApplicationsAsync(candidateId, jobId);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(applications));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting applications");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = "An error occurred" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}
