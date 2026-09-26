namespace WomenTeens.DTOs;

public class MonitorRequest
{
    public Guid TripId { get; set; }
    public string ContactName { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string ContactEmail { get; set; } = "";

    /// <summary>Контрольная дата возврата: "2026-09-28"</summary>
    public string DeadlineDate { get; set; } = "";

    /// <summary>Контрольное время возврата: "21:00"</summary>
    public string DeadlineTime { get; set; } = "";
}
