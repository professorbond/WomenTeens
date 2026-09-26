namespace WomenTeens.Models;

public class Trip
{
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Массив координат маршрута [[lat,lng],...] в JSON</summary>
    public string RouteGeoJson { get; set; } = "";

    public double DistanceKm { get; set; }
    public int ElevationGainM { get; set; }

    public DateOnly StartDate { get; set; }
    public TimeOnly StartTime { get; set; }

    /// <summary>"beginner" | "medium" | "expert"</summary>
    public string Experience { get; set; } = "";

    public int GroupSize { get; set; } = 1;

    /// <summary>JSON объект со снаряжением {firstAid, powerbank, membrane, flashlight, water, warmClothing}</summary>
    public string GearJson { get; set; } = "{}";

    /// <summary>Safety Score от 0 до 100, заполняется после аудита</summary>
    public int? SafetyScore { get; set; }

    /// <summary>"low" | "medium" | "high" | "critical"</summary>
    public string? RiskLevel { get; set; }

    public string? AuditSummary { get; set; }

    /// <summary>JSON массив строк-рекомендаций</summary>
    public string? RecommendationsJson { get; set; }

    /// <summary>Кэш данных о погоде в JSON</summary>
    public string? WeatherDataJson { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навигационные свойства
    public ICollection<AuditIssue> Issues { get; set; } = new List<AuditIssue>();
    public TripMonitor? Monitor { get; set; }
}
