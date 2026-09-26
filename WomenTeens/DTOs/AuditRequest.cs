namespace WomenTeens.DTOs;

public class AuditRequest
{
    /// <summary>Список точек маршрута [[lat,lng],...]</summary>
    public List<double[]> Route { get; set; } = new();

    public double DistanceKm { get; set; }
    public int ElevationGainM { get; set; }

    /// <summary>Дата похода в формате "2026-09-28"</summary>
    public string Date { get; set; } = "";

    /// <summary>Время старта в формате "08:00"</summary>
    public string StartTime { get; set; } = "";

    /// <summary>"beginner" | "medium" | "expert"</summary>
    public string Experience { get; set; } = "";

    public int GroupSize { get; set; } = 1;

    public GearDto Gear { get; set; } = new();
}

public class GearDto
{
    public bool FirstAid { get; set; }      // аптечка
    public bool Powerbank { get; set; }     // пауэрбанк
    public bool Membrane { get; set; }      // мембранная куртка
    public bool Flashlight { get; set; }    // фонарик
    public bool Water { get; set; }         // запас воды
    public bool WarmClothing { get; set; }  // тёплая одежда
}
