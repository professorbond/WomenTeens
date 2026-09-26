namespace WomenTeens.Models;

public class AuditIssue
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }

    /// <summary>"weather" | "gear" | "time" | "elevation"</summary>
    public string Type { get; set; } = "";

    /// <summary>"info" | "warning" | "critical"</summary>
    public string Severity { get; set; } = "";

    /// <summary>Текст предупреждения на русском с цифрами</summary>
    public string Text { get; set; } = "";

    // Навигационное свойство
    public Trip Trip { get; set; } = null!;
}
