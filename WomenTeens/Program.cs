using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Text.Json;
using WomenTeens.Data;
using WomenTeens.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// ── БД ──────────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── CORS (dev: открываем всё) ────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ── JSON — camelCase для всех ответов ────────────────────────────────────────
builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// ── OpenAPI (встроенный в .NET 10) + Scalar UI ───────────────────────────────
builder.Services.AddOpenApi();

// ── HTTP-клиент (для WeatherService и GeminiService) ─────────────────────────
builder.Services.AddHttpClient();

var app = builder.Build();

// ── Авто-миграция при старте ─────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

// ── Middleware ───────────────────────────────────────────────────────────────
app.UseCors();

// ── Scalar API Docs — только в Development (аналог Swagger) ─────────────────
// Открывается по адресу: http://localhost:5000/scalar/v1
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title       = "PeakGuard API 🏔️";
        options.Theme       = ScalarTheme.DeepSpace;
        options.DefaultHttpClient = new(ScalarTarget.JavaScript, ScalarClient.Fetch);
    });
}

// ── Health-check ─────────────────────────────────────────────────────────────
app.MapGet("/", () => Results.Ok(new { status = "PeakGuard API is running 🏔️" }))
   .WithTags("Health");

// ── API Эндпоинты ────────────────────────────────────────────────────────────
app.MapTripEndpoints();
app.MapAuditEndpoints();
app.MapMonitorEndpoints();

app.Run();
