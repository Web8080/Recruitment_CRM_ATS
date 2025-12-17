using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace Functions.Shared.Services;

public interface IRateLimitingService
{
    bool IsAllowed(string identifier, int maxRequests = 100, TimeSpan? window = null);
    void Reset(string identifier);
}

public class RateLimitingService : IRateLimitingService
{
    private readonly ILogger<RateLimitingService> _logger;
    private readonly ConcurrentDictionary<string, RateLimitInfo> _rateLimits = new();
    
    public RateLimitingService(ILogger<RateLimitingService> logger)
    {
        _logger = logger;
    }
    
    public bool IsAllowed(string identifier, int maxRequests = 100, TimeSpan? window = null)
    {
        var timeWindow = window ?? TimeSpan.FromMinutes(1);
        var now = DateTime.UtcNow;
        
        if (!_rateLimits.TryGetValue(identifier, out var limitInfo))
        {
            limitInfo = new RateLimitInfo
            {
                RequestCount = 1,
                WindowStart = now
            };
            _rateLimits.TryAdd(identifier, limitInfo);
            return true;
        }
        
        if (now - limitInfo.WindowStart > timeWindow)
        {
            limitInfo.RequestCount = 1;
            limitInfo.WindowStart = now;
            return true;
        }
        
        if (limitInfo.RequestCount >= maxRequests)
        {
            _logger.LogWarning("Rate limit exceeded for {Identifier}", identifier);
            return false;
        }
        
        limitInfo.RequestCount++;
        return true;
    }
    
    public void Reset(string identifier)
    {
        _rateLimits.TryRemove(identifier, out _);
    }
    
    private class RateLimitInfo
    {
        public int RequestCount { get; set; }
        public DateTime WindowStart { get; set; }
    }
}

