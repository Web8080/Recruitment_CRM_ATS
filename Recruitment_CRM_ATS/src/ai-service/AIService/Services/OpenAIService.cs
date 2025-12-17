using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace AIService.Services;

public class OpenAIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAIService> _logger;
    private readonly string _apiKey;
    private readonly string _model;
    private readonly string _baseUrl = "https://api.openai.com/v1/chat/completions";

    public OpenAIService(HttpClient httpClient, ILogger<OpenAIService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? string.Empty;
        _model = Environment.GetEnvironmentVariable("OPENAI_MODEL") ?? "gpt-4";

        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("OPENAI_API_KEY is not set");
        }

        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken cancellationToken = default)
    {
        return await GenerateTextAsync(prompt, 2000, cancellationToken);
    }

    public async Task<string> GenerateTextAsync(string prompt, int maxTokens, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("OpenAI API key is not configured");
        }

        try
        {
            var requestBody = new
            {
                model = _model,
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful assistant specialized in recruitment and HR tasks." },
                    new { role = "user", content = prompt }
                },
                max_tokens = maxTokens,
                temperature = 0.7
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_baseUrl, content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var responseObject = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);

            if (responseObject?.Choices == null || responseObject.Choices.Length == 0)
            {
                throw new Exception("No response from OpenAI API");
            }

            return responseObject.Choices[0].Message.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenAI API");
            throw;
        }
    }

    public async Task<T> GenerateStructuredResponseAsync<T>(string prompt, CancellationToken cancellationToken = default) where T : class
    {
        var responseText = await GenerateTextAsync(prompt, cancellationToken);
        
        try
        {
            return JsonSerializer.Deserialize<T>(responseText) ?? throw new Exception("Failed to deserialize response");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse JSON response from OpenAI");
            throw new Exception("AI service returned invalid JSON format", ex);
        }
    }

    private class OpenAIResponse
    {
        public Choice[]? Choices { get; set; }
    }

    private class Choice
    {
        public Message? Message { get; set; }
    }

    private class Message
    {
        public string? Content { get; set; }
    }
}


