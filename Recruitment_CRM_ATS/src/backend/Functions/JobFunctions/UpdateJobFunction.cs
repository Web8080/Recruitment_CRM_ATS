using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Models;
using Functions.Shared.Services;

namespace Functions.JobFunctions;

public class UpdateJobFunction
{
    private readonly IDatabaseService _databaseService;
    private readonly IRateLimitingService _rateLimiting;
    private readonly ILogger _logger;

    public UpdateJobFunction(
        IDatabaseService databaseService,
        IRateLimitingService rateLimiting,
        ILoggerFactory loggerFactory)
    {
        _databaseService = databaseService;
        _rateLimiting = rateLimiting;
        _logger = loggerFactory.CreateLogger<UpdateJobFunction>();
    }

    [Function("UpdateJob")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "jobs/{id}")] HttpRequestData req,
        string id)
    {
        _logger.LogInformation("UpdateJob function processed a request for {JobId}.", id);

        if (!Guid.TryParse(id, out var jobId))
        {
            var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid job ID" }));
            badResponse.Headers.Add("Content-Type", "application/json");
            return badResponse;
        }

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var jobRequest = JsonSerializer.Deserialize<JobRequest>(requestBody);

            if (jobRequest == null)
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "Invalid job data" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var existingJob = await _databaseService.GetJobByIdAsync(jobId);
            if (existingJob == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                notFoundResponse.WriteString(JsonSerializer.Serialize(new { error = "Job not found" }));
                notFoundResponse.Headers.Add("Content-Type", "application/json");
                return notFoundResponse;
            }

            existingJob.Title = jobRequest.Title;
            existingJob.Department = jobRequest.Department;
            existingJob.Location = jobRequest.Location;
            if (!string.IsNullOrEmpty(jobRequest.Status))
                existingJob.Status = jobRequest.Status;
            existingJob.Description = jobRequest.Description;
            existingJob.Requirements = jobRequest.Requirements;
            existingJob.Responsibilities = jobRequest.Responsibilities;
            existingJob.SalaryMin = jobRequest.SalaryMin;
            existingJob.SalaryMax = jobRequest.SalaryMax;
            existingJob.EmploymentType = jobRequest.EmploymentType;
            existingJob.OpenPositions = jobRequest.OpenPositions;

            var updatedJob = await _databaseService.UpdateJobAsync(jobId, existingJob);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.WriteString(JsonSerializer.Serialize(updatedJob));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating job {JobId}", jobId);
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = $"Error: {ex.Message}" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}
