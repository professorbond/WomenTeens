using System.Text.Json;

namespace WomenTeens.Services;

/// <summary>
/// Получает реальный прогноз погоды с Open-Meteo API (бесплатный, без ключа).
/// </summary>
public class WeatherService
{
    private readonly HttpClient _http;

    public WeatherService(HttpClient http)
    {
        _http = http;
    }

    /// <summary>
    /// Получить прогноз на конкретную дату для координат.
    /// Возвращает WeatherForecast с температурой, ветром, осадками и т.д.
    /// </summary>
    public async Task<WeatherForecast> GetForecastAsync(double lat, double lon, DateOnly date)
    {
        var dateStr = date.ToString("yyyy-MM-dd");

        // Open-Meteo бесплатный API: получаем почасовой прогноз на день
        var url = $"https://api.open-meteo.com/v1/forecast" +
                  $"?latitude={lat}&longitude={lon}" +
                  $"&hourly=temperature_2m,wind_speed_10m,precipitation_probability,weather_code" +
                  $"&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max" +
                  $"&timezone=auto" +
                  $"&start_date={dateStr}&end_date={dateStr}";

        try
        {
            var json = await _http.GetStringAsync(url);
            var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var daily = root.GetProperty("daily");

            var tempMax = GetDoubleOrNull(daily, "temperature_2m_max") ?? 0;
            var tempMin = GetDoubleOrNull(daily, "temperature_2m_min") ?? 0;
            var windMax = GetDoubleOrNull(daily, "wind_speed_10m_max") ?? 0;
            var precipProb = GetDoubleOrNull(daily, "precipitation_probability_max") ?? 0;

            var sunrise = GetStringOrNull(daily, "sunrise") ?? "";
            var sunset = GetStringOrNull(daily, "sunset") ?? "";

            // Извлекаем почасовые данные для более детальной картины
            var hourly = root.GetProperty("hourly");
            var temperatures = hourly.GetProperty("temperature_2m").EnumerateArray()
                .Select(x => x.GetDouble()).ToList();
            var windSpeeds = hourly.GetProperty("wind_speed_10m").EnumerateArray()
                .Select(x => x.GetDouble()).ToList();
            var weatherCodes = hourly.GetProperty("weather_code").EnumerateArray()
                .Select(x => x.GetInt32()).ToList();

            // Определяем опасные погодные коды (гроза 95-99, снег 71-77, ливень 65-67)
            var hasDangerousWeather = weatherCodes.Any(code =>
                code >= 95 || // Грозы
                (code >= 71 && code <= 77) || // Снегопад
                (code >= 65 && code <= 67));   // Сильный дождь

            return new WeatherForecast
            {
                TempMax = tempMax,
                TempMin = tempMin,
                WindMaxKmh = windMax,
                PrecipitationProbability = precipProb,
                Sunrise = sunrise,
                Sunset = sunset,
                HourlyTemps = temperatures,
                HourlyWinds = windSpeeds,
                HourlyWeatherCodes = weatherCodes,
                HasDangerousWeather = hasDangerousWeather
            };
        }
        catch (Exception ex)
        {
            // Если API недоступен, возвращаем пустой прогноз (не ломаем аудит)
            Console.WriteLine($"[WeatherService] Open-Meteo error: {ex.Message}");
            return new WeatherForecast();
        }
    }

    private static double? GetDoubleOrNull(JsonElement parent, string prop)
    {
        if (!parent.TryGetProperty(prop, out var arr)) return null;
        var first = arr.EnumerateArray().FirstOrDefault();
        return first.ValueKind == JsonValueKind.Number ? first.GetDouble() : null;
    }

    private static string? GetStringOrNull(JsonElement parent, string prop)
    {
        if (!parent.TryGetProperty(prop, out var arr)) return null;
        var first = arr.EnumerateArray().FirstOrDefault();
        return first.ValueKind == JsonValueKind.String ? first.GetString() : null;
    }
}

public class WeatherForecast
{
    public double TempMax { get; set; }
    public double TempMin { get; set; }
    public double WindMaxKmh { get; set; }
    public double PrecipitationProbability { get; set; }
    public string Sunrise { get; set; } = "";
    public string Sunset { get; set; } = "";
    public List<double> HourlyTemps { get; set; } = new();
    public List<double> HourlyWinds { get; set; } = new();
    public List<int> HourlyWeatherCodes { get; set; } = new();
    public bool HasDangerousWeather { get; set; }
}
