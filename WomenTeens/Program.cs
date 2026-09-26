using Microsoft.EntityFrameworkCore;
using WomenTeens.Data;

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

// ── OpenAPI (встроенный в .NET 10) ───────────────────────────────────────────
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
app.MapOpenApi();

// ── Health-check endpoint ────────────────────────────────────────────────────
app.MapGet("/", () => Results.Ok(new { status = "PeakGuard API is running 🏔️" }));

app.Run();
