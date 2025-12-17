using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AIService.Services;
using AIService.Factories;
using Functions.Shared.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddApplicationInsightsTelemetryWorkerService();
        services.ConfigureFunctionsApplicationInsights();
        
        services.AddHttpClient();
        
        // AI Services
        services.AddSingleton<IAIServiceFactory, AIServiceFactory>();
        services.AddScoped<IAIService>(provider =>
        {
            var factory = provider.GetRequiredService<IAIServiceFactory>();
            var useFallback = Environment.GetEnvironmentVariable("AI_USE_FALLBACK")?.ToLower() == "true";
            
            if (useFallback)
            {
                return factory.CreateFallbackService();
            }
            
            var providerName = Environment.GetEnvironmentVariable("AI_PROVIDER") ?? "ollama";
            return factory.CreateService(providerName);
        });
        
        // Database Service
        services.AddSingleton<IDatabaseService, DatabaseService>();
        
        // Auth Service
        services.AddSingleton<IAuthService, AuthService>();
    })
    .Build();

host.Run();

