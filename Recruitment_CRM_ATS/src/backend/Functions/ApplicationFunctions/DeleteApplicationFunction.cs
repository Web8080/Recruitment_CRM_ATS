using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.ApplicationFunctions;

public class DeleteApplicationFunction
{
    private readonly ILogger _logger;
    private readonly IDatabaseService _databaseService;

    public DeleteApplicationFunction(ILoggerFactory loggerFactory, IDatabaseService databaseService)
    {
        _logger = loggerFactory.CreateLogger<DeleteApplicationFunction>();
        _databaseService = databaseService;
    }

    [Function("DeleteApplication")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "delete", Route = "applications/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("DeleteApplication function processed a request for {ApplicationId}", id);

        try
        {
            if (!Guid.TryParse(id, out var applicationId))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                await badResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Invalid application ID" }));
                return badResponse;
            }

            var deleted = await _databaseService.DeleteApplicationAsync(applicationId);

            if (!deleted)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = "Application not found" }));
                return notFoundResponse;
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteStringAsync(JsonSerializer.Serialize(new { message = "Application deleted successfully" }));
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting application {ApplicationId}", id);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteStringAsync(JsonSerializer.Serialize(new { error = ex.Message }));
            return errorResponse;
        }
    }
}

