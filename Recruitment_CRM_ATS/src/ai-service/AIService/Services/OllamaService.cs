using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace AIService.Services;

public class OllamaService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OllamaService> _logger;
    private readonly string _baseUrl;
    private readonly string _model;

    public OllamaService(HttpClient httpClient, ILogger<OllamaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = Environment.GetEnvironmentVariable("OLLAMA_BASE_URL") ?? "http://localhost:11434";
        _model = Environment.GetEnvironmentVariable("OLLAMA_MODEL") ?? "llama2";

        _httpClient.BaseAddress = new Uri(_baseUrl);
    }

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken cancellationToken = default)
    {
        return await GenerateTextAsync(prompt, 2000, cancellationToken);
    }

    public async Task<string> GenerateTextAsync(string prompt, int maxTokens, CancellationToken cancellationToken = default)
    {
        try
        {
            var requestBody = new
            {
                model = _model,
                prompt = prompt,
                stream = false,
                options = new
                {
                    num_predict = maxTokens,
                    temperature = 0.7
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/generate", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            var responseObject = JsonSerializer.Deserialize<OllamaResponse>(responseContent);

            if (responseObject?.Response == null)
            {
                throw new Exception("No response from Ollama API");
            }

            return responseObject.Response;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error calling Ollama API. Make sure Ollama is running at {BaseUrl}", _baseUrl);
            throw new Exception($"Failed to connect to Ollama service at {_baseUrl}. Please ensure Ollama is running.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Ollama API");
            throw;
        }
    }

    public async Task<T> GenerateStructuredResponseAsync<T>(string prompt, CancellationToken cancellationToken = default) where T : class
    {
        var enhancedPrompt = $@"{prompt}

Please respond with valid JSON only, no additional text or formatting.";
        
        var responseText = await GenerateTextAsync(enhancedPrompt, cancellationToken);
        
        try
        {
            var cleanedResponse = responseText.Trim();
            if (cleanedResponse.StartsWith("```json"))
            {
                cleanedResponse = cleanedResponse.Replace("```json", "").Replace("```", "").Trim();
            }
            else if (cleanedResponse.StartsWith("```"))
            {
                cleanedResponse = cleanedResponse.Replace("```", "").Trim();
            }

            return JsonSerializer.Deserialize<T>(cleanedResponse) ?? throw new Exception("Failed to deserialize response");
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse JSON response from Ollama");
            throw new Exception("AI service returned invalid JSON format", ex);
        }
    }

    private class OllamaResponse
    {
        public string? Response { get; set; }
    }
}


