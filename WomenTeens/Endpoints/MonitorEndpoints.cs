using Microsoft.EntityFrameworkCore;
using WomenTeens.Data;
using WomenTeens.DTOs;
using WomenTeens.Models;

namespace WomenTeens.Endpoints;

public static class MonitorEndpoints
{
    public static void MapMonitorEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/monitor").WithTags("Monitor");

        // POST /api/monitor — сохранить контакт доверенного лица + дедлайн
        group.MapPost("/", async (MonitorRequest request, AppDbContext db) =>
        {
            // Проверяем что поход существует
            var tripExists = await db.Trips.AnyAsync(t => t.Id == request.TripId);
            if (!tripExists)
                return Results.NotFound(new { message = "Поход не найден" });

            // Парсим дату и время дедлайна в UTC
            if (!DateOnly.TryParse(request.DeadlineDate, out var deadlineDate) ||
                !TimeOnly.TryParse(request.DeadlineTime, out var deadlineTime))
            {
                return Results.BadRequest(new { message = "Некорректный формат даты или времени дедлайна" });
            }

            var deadline = new DateTime(
                deadlineDate.Year, deadlineDate.Month, deadlineDate.Day,
                deadlineTime.Hour, deadlineTime.Minute, 0,
                DateTimeKind.Utc);

            var monitor = new TripMonitor
            {
                TripId       = request.TripId,
                ContactName  = request.ContactName,
                ContactPhone = request.ContactPhone,
                ContactEmail = request.ContactEmail,
                Deadline     = deadline
            };

            db.Monitors.Add(monitor);
            await db.SaveChangesAsync();

            return Results.Created($"/api/monitor/{monitor.Id}", new
            {
                monitorId = monitor.Id,
                tripId    = monitor.TripId,
                deadline  = monitor.Deadline
            });
        })
        .WithName("CreateMonitor")
        .WithSummary("Сохранить контакт доверенного лица и контрольное время возврата");

        // POST /api/monitor/checkin/{tripId} — турист нажимает "Я вернулся"
        group.MapPost("/checkin/{tripId:guid}", async (Guid tripId, AppDbContext db) =>
        {
            var monitor = await db.Monitors.FirstOrDefaultAsync(m => m.TripId == tripId);
            if (monitor is null)
                return Results.NotFound(new { message = "Мониторинг не найден" });

            monitor.CheckinDone = true;
            monitor.CheckinAt   = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Results.Ok(new
            {
                message   = "Вы успешно отметились! Путешествие завершено.",
                checkinAt = monitor.CheckinAt
            });
        })
        .WithName("Checkin")
        .WithSummary("Турист отмечает возвращение — деактивирует dead-man switch");
    }
}
