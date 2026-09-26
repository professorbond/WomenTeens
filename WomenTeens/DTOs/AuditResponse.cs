namespace WomenTeens.DTOs;

public class AuditResponse
{
    public Guid TripId { get; set; }
    public int SafetyScore { get; set; }
    public string RiskLevel { get; set; } = "";
    public string Summary { get; set; } = "";
    public List<IssueDto> Issues { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class IssueDto
{
    /// <summary>"weather" | "gear" | "time" | "elevation"</summary>
    public string Type { get; set; } = "";

    /// <summary>"info" | "warning" | "critical"</summary>
    public string Severity { get; set; } = "";

    public string Text { get; set; } = "";
}
