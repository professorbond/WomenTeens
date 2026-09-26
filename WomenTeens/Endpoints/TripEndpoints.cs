using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using WomenTeens.Data;
using WomenTeens.DTOs;

namespace WomenTeens.Endpoints;

public static class TripEndpoints
{
    public static void MapTripEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/trips").WithTags("Trips");

        // GET /api/trips/{id}
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db) =>
        {
            var trip = await db.Trips
                .Include(t => t.Issues)
                .Include(t => t.Monitor)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip is null)
                return Results.NotFound(new { message = "Поход не найден" });

            // Десериализуем рекомендации из JSON
            var recommendations = new List<string>();
            if (!string.IsNullOrEmpty(trip.RecommendationsJson))
            {
                try
                {
                    recommendations = JsonSerializer.Deserialize<List<string>>(trip.RecommendationsJson)
                                      ?? new List<string>();
                }
                catch { /* игнорируем ошибки парсинга */ }
            }

            var dto = new TripDetailDto
            {
                Id              = trip.Id,
                DistanceKm      = trip.DistanceKm,
                ElevationGainM  = trip.ElevationGainM,
                StartDate       = trip.StartDate.ToString("yyyy-MM-dd"),
                StartTime       = trip.StartTime.ToString("HH:mm"),
                Experience      = trip.Experience,
                GroupSize       = trip.GroupSize,
                SafetyScore     = trip.SafetyScore,
                RiskLevel       = trip.RiskLevel,
                AuditSummary    = trip.AuditSummary,
                Recommendations = recommendations,
                HasMonitor      = trip.Monitor is not null,
                Issues          = trip.Issues.Select(i => new IssueDto
                {
                    Type     = i.Type,
                    Severity = i.Severity,
                    Text     = i.Text
                }).ToList()
            };

            return Results.Ok(dto);
        })
        .WithName("GetTrip")
        .WithSummary("Получить данные похода с issues и мониторингом");
    }
}
