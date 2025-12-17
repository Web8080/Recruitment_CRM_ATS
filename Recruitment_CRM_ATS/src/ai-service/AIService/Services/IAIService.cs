namespace AIService.Services;

public interface IAIService
{
    Task<string> GenerateTextAsync(string prompt, CancellationToken cancellationToken = default);
    Task<string> GenerateTextAsync(string prompt, int maxTokens, CancellationToken cancellationToken = default);
    Task<T> GenerateStructuredResponseAsync<T>(string prompt, CancellationToken cancellationToken = default) where T : class;
}


