using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using AIService.Services;

namespace Functions.AIServiceFunctions;

public class ParseResumeFunction
{
    private readonly ILogger _logger;
    private readonly IAIService _aiService;

    public ParseResumeFunction(ILoggerFactory loggerFactory, IAIService aiService)
    {
        _logger = loggerFactory.CreateLogger<ParseResumeFunction>();
        _aiService = aiService;
    }

    [Function("ParseResume")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "ai/parse-resume")] HttpRequestData req)
    {
        _logger.LogInformation("ParseResume function processed a request.");

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonSerializer.Deserialize<ParseResumeRequest>(requestBody);

            if (request == null || string.IsNullOrEmpty(request.ResumeText))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString("Resume text is required.");
                return badResponse;
            }

            var prompt = $@"Extract the following information from this resume in JSON format:
{{
  ""fullName"": ""string"",
  ""email"": ""string"",
  ""phone"": ""string"",
  ""skills"": [""string""],
  ""experience"": [
    {{
      ""company"": ""string"",
      ""position"": ""string"",
      ""duration"": ""string"",
      ""description"": ""string""
    }}
  ],
  ""education"": [
    {{
      ""institution"": ""string"",
      ""degree"": ""string"",
      ""year"": ""string""
    }}
  ]
}}

Resume text:
{request.ResumeText}";

            var extractedData = await _aiService.GenerateTextAsync(prompt);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");

            var result = new
            {
                extractedData = extractedData,
                rawText = request.ResumeText
            };

            response.WriteString(JsonSerializer.Serialize(result));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing resume");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString($"Error: {ex.Message}");
            return errorResponse;
        }
    }
}

public class ParseResumeRequest
{
    public string ResumeText { get; set; } = string.Empty;
}


