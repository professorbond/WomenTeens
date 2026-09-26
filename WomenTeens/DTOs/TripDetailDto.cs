namespace WomenTeens.DTOs;

public class TripDetailDto
{
    public Guid Id { get; set; }
    public double DistanceKm { get; set; }
    public int ElevationGainM { get; set; }

    /// <summary>"2026-09-28"</summary>
    public string StartDate { get; set; } = "";

    /// <summary>"08:00"</summary>
    public string StartTime { get; set; } = "";

    /// <summary>"beginner" | "medium" | "expert"</summary>
    public string Experience { get; set; } = "";

    public int GroupSize { get; set; }

    /// <summary>Safety Score 0–100, null если аудит ещё не проводился</summary>
    public int? SafetyScore { get; set; }

    /// <summary>"low" | "medium" | "high" | "critical"</summary>
    public string? RiskLevel { get; set; }

    public string? AuditSummary { get; set; }

    public List<string> Recommendations { get; set; } = new();
    public List<IssueDto> Issues { get; set; } = new();

    /// <summary>Есть ли привязанный мониторинг (dead-man switch)</summary>
    public bool HasMonitor { get; set; }
}
