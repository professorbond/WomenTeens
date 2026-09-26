namespace WomenTeens.Models;

/// <summary>
/// Dead-man switch — контакт доверенного лица и контрольное время возврата.
/// Называется TripMonitor чтобы не конфликтовать с System.Threading.Monitor.
/// </summary>
public class TripMonitor
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TripId { get; set; }

    public string ContactName { get; set; } = "";
    public string ContactPhone { get; set; } = "";
    public string ContactEmail { get; set; } = "";

    /// <summary>Контрольное время возврата в UTC</summary>
    public DateTime Deadline { get; set; }

    /// <summary>Нажал ли турист "Я вернулся"</summary>
    public bool CheckinDone { get; set; } = false;

    /// <summary>Когда нажал "Я вернулся"</summary>
    public DateTime? CheckinAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Навигационное свойство
    public Trip Trip { get; set; } = null!;
}
