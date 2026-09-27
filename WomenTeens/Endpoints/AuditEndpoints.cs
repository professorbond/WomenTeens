using System.Text.Json;
using WomenTeens.Data;
using WomenTeens.DTOs;
using WomenTeens.Models;
using WomenTeens.Services;

namespace WomenTeens.Endpoints;

public static class AuditEndpoints
{
    public static void MapAuditEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/audit").WithTags("Audit");

        // POST /api/audit
        group.MapPost("/", async (AuditRequest request, AppDbContext db,
            WeatherService weatherService, GeminiService geminiService) =>
        {
            // Валидация: минимум 2 точки маршрута
            if (request.Route.Count < 2)
                return Results.BadRequest(new { message = "Маршрут должен содержать минимум 2 точки" });

            // Сериализуем данные
            var gearJson = JsonSerializer.Serialize(request.Gear);
            var routeJson = JsonSerializer.Serialize(request.Route);

            // Парсим дату и время
            DateOnly.TryParse(request.Date, out var startDate);
            TimeOnly.TryParse(request.StartTime, out var startTime);

            // ═══════════════════════════════════════════════════════════
            // 1. Получаем РЕАЛЬНУЮ погоду с Open-Meteo
            // ═══════════════════════════════════════════════════════════
            var firstPoint = request.Route[0];
            var weather = await weatherService.GetForecastAsync(
                firstPoint[0], firstPoint[1], startDate);

            // ═══════════════════════════════════════════════════════════
            // 2. Отправляем всё в Gemini AI для анализа
            // ═══════════════════════════════════════════════════════════
            var analysisInput = new TripAnalysisInput
            {
                DistanceKm   = request.DistanceKm,
                ElevationGainM = request.ElevationGainM,
                Date         = request.Date,
                StartTime    = request.StartTime,
                Experience   = request.Experience,
                GroupSize    = request.GroupSize,
                Gear = new GearInput
                {
                    FirstAid     = request.Gear.FirstAid,
                    Powerbank    = request.Gear.Powerbank,
                    Membrane     = request.Gear.Membrane,
                    Flashlight   = request.Gear.Flashlight,
                    Water        = request.Gear.Water,
                    WarmClothing = request.Gear.WarmClothing
                },
                Weather = weather
            };

            var aiResult = await geminiService.AnalyzeTripAsync(analysisInput);

            // ═══════════════════════════════════════════════════════════
            // 3. Сохраняем результат в БД
            // ═══════════════════════════════════════════════════════════
            var issues = aiResult.Issues.Select(i => new AuditIssue
            {
                Type     = i.Type,
                Severity = i.Severity,
                Text     = i.Text
            }).ToList();

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
                SafetyScore          = aiResult.SafetyScore,
                RiskLevel            = aiResult.RiskLevel,
                AuditSummary         = aiResult.Summary,
                RecommendationsJson  = JsonSerializer.Serialize(aiResult.Recommendations),
                Issues               = issues
            };

            db.Trips.Add(trip);
            await db.SaveChangesAsync();

            // ═══════════════════════════════════════════════════════════
            // 4. Возвращаем ответ
            // ═══════════════════════════════════════════════════════════
            var response = new AuditResponse
            {
                TripId          = trip.Id,
                SafetyScore     = trip.SafetyScore!.Value,
                RiskLevel       = trip.RiskLevel!,
                Summary         = trip.AuditSummary!,
                Recommendations = aiResult.Recommendations,
                Issues          = issues.Select(i => new IssueDto
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
