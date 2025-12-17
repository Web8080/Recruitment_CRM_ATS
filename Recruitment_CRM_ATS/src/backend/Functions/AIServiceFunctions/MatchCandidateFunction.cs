using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using AIService.Services;

namespace Functions.AIServiceFunctions;

public class MatchCandidateFunction
{
    private readonly ILogger _logger;
    private readonly IAIService _aiService;

    public MatchCandidateFunction(ILoggerFactory loggerFactory, IAIService aiService)
    {
        _logger = loggerFactory.CreateLogger<MatchCandidateFunction>();
        _aiService = aiService;
    }

    [Function("MatchCandidate")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "ai/match-candidate")] HttpRequestData req)
    {
        _logger.LogInformation("MatchCandidate function processed a request.");

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<MatchCandidateRequest>(requestBody);

            if (request == null || string.IsNullOrEmpty(request.CandidateProfile) || string.IsNullOrEmpty(request.JobDescription))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString("Candidate profile and job description are required.");
                return badResponse;
            }

            var prompt = $@"Analyze the match between this candidate profile and job description. 
Provide a match score (0-100) and detailed analysis in JSON format:
{{
  ""matchScore"": 0-100,
  ""strengths"": [""string""],
  ""weaknesses"": [""string""],
  ""recommendation"": ""string"",
  ""keySkillsMatch"": [""string""],
  ""missingSkills"": [""string""]
}}

Candidate Profile:
{request.CandidateProfile}

Job Description:
{request.JobDescription}";

            var matchAnalysis = await _aiService.GenerateTextAsync(prompt);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");

            var result = new
            {
                matchAnalysis = matchAnalysis,
                timestamp = DateTime.UtcNow
            };

            response.WriteString(JsonSerializer.Serialize(result));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error matching candidate");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString($"Error: {ex.Message}");
            return errorResponse;
        }
    }
}

public class MatchCandidateRequest
{
    public string CandidateProfile { get; set; } = string.Empty;
    public string JobDescription { get; set; } = string.Empty;
}


