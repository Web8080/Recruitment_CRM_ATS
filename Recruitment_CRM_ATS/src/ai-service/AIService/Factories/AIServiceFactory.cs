using AIService.Services;
using Microsoft.Extensions.Logging;

namespace AIService.Factories;

public interface IAIServiceFactory
{
    IAIService CreateService(string providerName);
    IAIService CreateFallbackService();
}

public class AIServiceFactory : IAIServiceFactory
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILoggerFactory _loggerFactory;

    public AIServiceFactory(IHttpClientFactory httpClientFactory, ILoggerFactory loggerFactory)
    {
        _httpClientFactory = httpClientFactory;
        _loggerFactory = loggerFactory;
    }

    public IAIService CreateService(string providerName)
    {
        var httpClient = _httpClientFactory.CreateClient();
        var logger = _loggerFactory.CreateLogger<IAIService>();

        return providerName.ToLowerInvariant() switch
        {
            "openai" => new OpenAIService(httpClient, _loggerFactory.CreateLogger<OpenAIService>()),
            "ollama" => new OllamaService(httpClient, _loggerFactory.CreateLogger<OllamaService>()),
            _ => throw new ArgumentException($"Unsupported AI provider: {providerName}. Supported providers: openai, ollama", nameof(providerName))
        };
    }

    public IAIService CreateFallbackService()
    {
        var ollamaService = CreateService("ollama");
        var openAIService = CreateService("openai");
        return new FallbackAIService(
            ollamaService,
            openAIService,
            _loggerFactory.CreateLogger<FallbackAIService>()
        );
    }
}

