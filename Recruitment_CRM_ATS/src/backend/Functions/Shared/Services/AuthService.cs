using Functions.Shared.Models;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace Functions.Shared.Services;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(string email, string password);
    Task<AuthResult> RegisterAsync(string email, string password, string firstName, string lastName, string role = "Recruiter");
    Task<bool> ValidateTokenAsync(string token);
    Task<User?> GetUserFromTokenAsync(string token);
    string GenerateToken(User user);
}

public class AuthResult
{
    public bool Success { get; set; }
    public string? Token { get; set; }
    public User? User { get; set; }
    public string? ErrorMessage { get; set; }
}

public class AuthService : IAuthService
{
    private readonly IDatabaseService _databaseService;
    private readonly ILogger<AuthService> _logger;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;
    
    public AuthService(IDatabaseService databaseService, ILogger<AuthService> logger)
    {
        _databaseService = databaseService;
        _logger = logger;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "your-super-secret-key-change-in-production-min-32-chars";
        _jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "RecruitmentCRM";
        _jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "RecruitmentCRMUsers";
    }
    
    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        try
        {
            var user = await _databaseService.GetUserByEmailAsync(email);
            if (user == null || !user.IsActive)
            {
                return new AuthResult { Success = false, ErrorMessage = "Invalid email or password" };
            }
            
            // Placeholder: In production, verify password hash
            // For now, accept any password for demo (replace with actual hash verification)
            // var isValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            // if (!isValid) return new AuthResult { Success = false, ErrorMessage = "Invalid email or password" };
            
            user.LastLoginAt = DateTime.UtcNow;
            var token = GenerateToken(user);
            
            _logger.LogInformation("User logged in: {Email}", email);
            return new AuthResult { Success = true, Token = token, User = user };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for {Email}", email);
            return new AuthResult { Success = false, ErrorMessage = "An error occurred during login" };
        }
    }
    
    public async Task<AuthResult> RegisterAsync(string email, string password, string firstName, string lastName, string role = "Recruiter")
    {
        try
        {
            var existingUser = await _databaseService.GetUserByEmailAsync(email);
            if (existingUser != null)
            {
                return new AuthResult { Success = false, ErrorMessage = "Email already registered" };
            }
            
            // Placeholder: Hash password in production
            // var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
            
            var user = new User
            {
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            
            user = await _databaseService.CreateUserAsync(user);
            var token = GenerateToken(user);
            
            _logger.LogInformation("User registered: {Email}", email);
            return new AuthResult { Success = true, Token = token, User = user };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration for {Email}", email);
            return new AuthResult { Success = false, ErrorMessage = "An error occurred during registration" };
        }
    }
    
    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("UserId", user.Id.ToString())
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    public Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecret);
            
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtIssuer,
                ValidateAudience = true,
                ValidAudience = _jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);
            
            return Task.FromResult(true);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }
    
    public async Task<User?> GetUserFromTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "UserId");
            
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                return null;
            
            var users = await _databaseService.GetUsersAsync();
            return users.FirstOrDefault(u => u.Id == userId);
        }
        catch
        {
            return null;
        }
    }
}
