using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.JobFunctions;

public class GetJobsFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public GetJobsFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<GetJobsFunction>();
    }

    [Function("GetJobs")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "jobs")] HttpRequestData req)
    {
        _logger.LogInformation("GetJobs function processed a request.");

        var clientIp = req.Headers.GetValues("X-Forwarded-For").FirstOrDefault() ?? "unknown";
        if (!_rateLimiting.IsAllowed($"jobs-{clientIp}", maxRequests: 100))
        {
            var rateLimitResponse = req.CreateResponse(HttpStatusCode.TooManyRequests);
            rateLimitResponse.WriteString(JsonSerializer.Serialize(new { error = "Rate limit exceeded" }));
            rateLimitResponse.Headers.Add("Content-Type", "application/json");
            return rateLimitResponse;
        }

        try
        {
            var queryParams = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var status = queryParams["status"];

            var jobs = await _databaseService.GetJobsAsync(status);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(jobs));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting jobs");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = "An error occurred" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}
