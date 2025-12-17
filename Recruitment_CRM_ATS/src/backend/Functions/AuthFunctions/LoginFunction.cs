using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Functions.Shared.Services;

namespace Functions.AuthFunctions;

public class LoginFunction
{
    private readonly IAuthService _authService;
    private readonly ILogger _logger;

    public LoginFunction(IAuthService authService, ILoggerFactory loggerFactory)
    {
        _authService = authService;
        _logger = loggerFactory.CreateLogger<LoginFunction>();
    }

    [Function("Login")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "auth/login")] HttpRequestData req)
    {
        _logger.LogInformation("Login function processed a request.");

        try
        {
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var loginRequest = JsonSerializer.Deserialize<LoginRequest>(requestBody);

            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
            {
                var badResponse = req.CreateResponse(HttpStatusCode.BadRequest);
                badResponse.WriteString(JsonSerializer.Serialize(new { error = "Email and password are required" }));
                badResponse.Headers.Add("Content-Type", "application/json");
                return badResponse;
            }

            var result = await _authService.LoginAsync(loginRequest.Email, loginRequest.Password);

            var response = req.CreateResponse(result.Success ? HttpStatusCode.OK : HttpStatusCode.Unauthorized);
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
            _logger.LogError(ex, "Error in login");
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            errorResponse.WriteString(JsonSerializer.Serialize(new { error = "An error occurred during login" }));
            errorResponse.Headers.Add("Content-Type", "application/json");
            return errorResponse;
        }
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
