using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.AuthFunctions;

public class RegisterFunction
{
    private readonly IAuthService _authService;
    private readonly ILogger _logger;

    public RegisterFunction(IAuthService authService, ILoggerFactory loggerFactory)
    {
        _authService = authService;
        _logger = loggerFactory.CreateLogger<RegisterFunction>();
    }

    [Function("Register")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/register")] HttpRequestData req)
    {
        _logger.LogInformation("Register function processed a request.");

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var registerRequest = JsonSerializer.Deserialize<RegisterRequest>(requestBody);

            if (registerRequest == null || 
                string.IsNullOrEmpty(registerRequest.Email) || 
                string.IsNullOrEmpty(registerRequest.Password) ||
                string.IsNullOrEmpty(registerRequest.FirstName) ||
                string.IsNullOrEmpty(registerRequest.LastName))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "All fields are required" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var result = await _authService.RegisterAsync(
                registerRequest.Email,
                registerRequest.Password,
                registerRequest.FirstName,
                registerRequest.LastName,
                registerRequest.Role ?? "Recruiter"
            );

            var response = req.CreateResponse(result.Success ? HttpStatusCode.Created : HttpStatusCode.BadRequest);
            response.Headers.Add("Content-Type", "application/json");

            if (result.Success)
            {
                response.WriteString(JsonSerializer.Serialize(new
                {
                    token = result.Token,
                    user = new
                    {
                        id = result.User!.Id,
                        email = result.User.Email,
                        firstName = result.User.FirstName,
                        lastName = result.User.LastName,
                        role = result.User.Role
                    }
                }));
            }
            else
            {
                response.WriteString(JsonSerializer.Serialize(new { error = result.ErrorMessage }));
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in registration");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = "An error occurred during registration" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Role { get; set; }
}
