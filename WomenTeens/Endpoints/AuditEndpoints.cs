using System.Text.Json;
using WomenTeens.Data;
using WomenTeens.DTOs;
using WomenTeens.Models;

namespace WomenTeens.Endpoints;

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/audit").WithTags("Audit");

        // POST /api/audit
        group.MapPost("/", async (AuditRequest request, AppDbContext db) =>
        {
            // Валидация: минимум 2 точки маршрута
            if (request.Route.Count < 2)
                return Results.BadRequest(new { message = "Маршрут должен содержать минимум 2 точки" });

            // Сериализуем снаряжение
            var gearJson = JsonSerializer.Serialize(request.Gear);

            // Сериализуем маршрут
            var routeJson = JsonSerializer.Serialize(request.Route);

            // Парсим дату и время
            DateOnly.TryParse(request.Date, out var startDate);
            TimeOnly.TryParse(request.StartTime, out var startTime);

            // --- Заглушка: тестовые данные аудита ---
            // TODO: заменить на вызов AuditService → WeatherService + GeminiService
            var testIssues = new List<AuditIssue>
            {
                new() { Type = "weather",   Severity = "critical", Text = "На перевале -5°C и ветер 15 м/с в день похода" },
                new() { Type = "gear",      Severity = "warning",  Text = "Отсутствует фонарик, закат в 17:40" },
                new() { Type = "elevation", Severity = "info",     Text = "Набор высоты 800м требует хорошей физической подготовки" }
            };

            var testRecommendations = new List<string>
            {
                "Возьмите тёплую мембранную куртку",
                "Фонарик обязателен — закат раньше конца маршрута",
                "Возьмите аварийный бивак на случай непогоды"
            };

            var trip = new Trip
            {
                RouteGeoJson         = routeJson,
                DistanceKm           = request.DistanceKm,
                ElevationGainM       = request.ElevationGainM,
                StartDate            = startDate,
                StartTime            = startTime,
                Experience           = request.Experience,
                GroupSize            = request.GroupSize,
                GearJson             = gearJson,
                SafetyScore          = 42,
                RiskLevel            = "high",
                AuditSummary         = "Тестовый аудит. Высокий риск из-за погодных условий и неполного снаряжения.",
                RecommendationsJson  = JsonSerializer.Serialize(testRecommendations),
                Issues               = testIssues
            };

            db.Trips.Add(trip);
            await db.SaveChangesAsync();

            var response = new AuditResponse
            {
                TripId          = trip.Id,
                SafetyScore     = trip.SafetyScore!.Value,
                RiskLevel       = trip.RiskLevel!,
                Summary         = trip.AuditSummary!,
                Recommendations = testRecommendations,
                Issues          = testIssues.Select(i => new IssueDto
                {
                    Type     = i.Type,
                    Severity = i.Severity,
                    Text     = i.Text
                }).ToList()
            };

            return Results.Created($"/api/trips/{trip.Id}", response);
        })
        .WithName("CreateAudit")
        .WithSummary("Запустить аудит безопасности маршрута (Weather + Gemini AI)");
    }
}
