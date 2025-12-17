using Microsoft.Extensions.Logging;

namespace AIService.Services;

public class FallbackAIService : IAIService
{
    private readonly IAIService _primaryService;
    private readonly IAIService _fallbackService;
    private readonly ILogger<FallbackAIService> _logger;

    public FallbackAIService(IAIService primaryService, IAIService fallbackService, ILogger<FallbackAIService> logger)
    {
        _primaryService = primaryService;
        _fallbackService = fallbackService;
        _logger = logger;
    }

    public async Task<string> GenerateTextAsync(string prompt, CancellationToken cancellationToken = default)
    {
        return await GenerateTextAsync(prompt, 2000, cancellationToken);
    }

    public async Task<string> GenerateTextAsync(string prompt, int maxTokens, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Attempting to generate text using primary AI service (Ollama)");
            return await _primaryService.GenerateTextAsync(prompt, maxTokens, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Primary AI service (Ollama) failed, falling back to OpenAI");
            
            try
            {
                return await _fallbackService.GenerateTextAsync(prompt, maxTokens, cancellationToken);
            }
            catch (Exception fallbackEx)
            {
                _logger.LogError(fallbackEx, "Both AI services failed");
                throw new Exception("Both primary and fallback AI services are unavailable", fallbackEx);
            }
        }
    }

    public async Task<T> GenerateStructuredResponseAsync<T>(string prompt, CancellationToken cancellationToken = default) where T : class
    {
        try
        {
            _logger.LogInformation("Attempting to generate structured response using primary AI service (Ollama)");
            return await _primaryService.GenerateStructuredResponseAsync<T>(prompt, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Primary AI service (Ollama) failed, falling back to OpenAI");
            
            try
            {
                return await _fallbackService.GenerateStructuredResponseAsync<T>(prompt, cancellationToken);
            }
            catch (Exception fallbackEx)
            {
                _logger.LogError(fallbackEx, "Both AI services failed");
                throw new Exception("Both primary and fallback AI services are unavailable", fallbackEx);
            }
        }
    }
}


