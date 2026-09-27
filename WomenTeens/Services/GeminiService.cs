using System.Text;
using System.Text.Json;

namespace WomenTeens.Services;

/// <summary>
/// Вызывает Google Gemini 2.0 Flash API для AI-анализа безопасности похода.
/// Принимает данные о маршруте + погоду → возвращает структурированный JSON.
/// </summary>
public class GeminiService
{
    private readonly HttpClient _http;
    private readonly string _apiKey;

    public GeminiService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["GeminiApiKey"] ?? "";
    }

    /// <summary>
    /// Отправляет промпт в Gemini и парсит структурированный ответ.
    /// </summary>
    public async Task<GeminiAuditResult> AnalyzeTripAsync(TripAnalysisInput input)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            Console.WriteLine("[GeminiService] No API key configured, using fallback scoring.");
            return BuildFallbackResult(input);
        }

        var prompt = BuildPrompt(input);

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.3,
                    maxOutputTokens = 2048,
                    responseMimeType = "application/json"
                }
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _http.PostAsync(url, jsonContent);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[GeminiService] API error {response.StatusCode}: {responseJson}");
                return BuildFallbackResult(input);
            }

            // Парсим ответ Gemini
            var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "{}";

            // Gemini возвращает JSON (мы просили responseMimeType = application/json)
            var result = JsonSerializer.Deserialize<GeminiAuditResult>(text, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? BuildFallbackResult(input);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GeminiService] Error: {ex.Message}");
            return BuildFallbackResult(input);
        }
    }

    private string BuildPrompt(TripAnalysisInput input)
    {
        return $$"""
        Ты — эксперт по горной безопасности и альпинизму. Проанализируй данные похода и выдай оценку безопасности.

        ## Данные маршрута:
        - Дистанция: {{input.DistanceKm.ToString("F1")}} км
        - Набор высоты: +{{input.ElevationGainM}} м
        - Дата: {{input.Date}}
        - Время старта: {{input.StartTime}}
        - Опыт группы: {{input.Experience}} (beginner/medium/expert)
        - Размер группы: {{input.GroupSize}} чел.

        ## Погода на маршруте (прогноз Open-Meteo):
        - Температура: от {{input.Weather.TempMin.ToString("F1")}}°C до {{input.Weather.TempMax.ToString("F1")}}°C
        - Максимальный ветер: {{input.Weather.WindMaxKmh.ToString("F0")}} км/ч
        - Вероятность осадков: {{input.Weather.PrecipitationProbability.ToString("F0")}}%
        - Рассвет: {{input.Weather.Sunrise}}
        - Закат: {{input.Weather.Sunset}}
        - Опасные метеоявления (грозы/снег/ливень): {{(input.Weather.HasDangerousWeather ? "ДА" : "нет")}}

        ## Снаряжение группы:
        - Аптечка: {{(input.Gear.FirstAid ? "✅" : "❌")}}
        - Пауэрбанк: {{(input.Gear.Powerbank ? "✅" : "❌")}}
        - Мембранная куртка: {{(input.Gear.Membrane ? "✅" : "❌")}}
        - Фонарик: {{(input.Gear.Flashlight ? "✅" : "❌")}}
        - Запас воды: {{(input.Gear.Water ? "✅" : "❌")}}
        - Тёплая одежда: {{(input.Gear.WarmClothing ? "✅" : "❌")}}

        ## Правила оценки:
        - SafetyScore от 0 до 100 (100 = идеально безопасно)
        - Штрафы: опасная погода -15..25, ветер >40км/ч -10, осадки >60% -10, нет аптечки -8, нет воды -10, новичок +набор >800м -15, нет фонарика при позднем старте -10
        - Бонусы: полное снаряжение +10, эксперт +5, группа 3+ чел +5

        Ответь СТРОГО в формате JSON (без markdown, без пояснений):
        {
          "safetyScore": <число 0-100>,
          "riskLevel": "<low|medium|high|critical>",
          "summary": "<краткое резюме на русском, 2-3 предложения>",
          "issues": [
            {
              "type": "<weather|gear|time|elevation>",
              "severity": "<info|warning|critical>",
              "text": "<описание проблемы на русском с конкретными цифрами>"
            }
          ],
          "recommendations": [
            "<рекомендация 1 на русском>",
            "<рекомендация 2 на русском>"
          ]
        }
        """;
    }

    /// <summary>
    /// Fallback-расчёт если Gemini недоступен — считаем по формуле.
    /// </summary>
    private GeminiAuditResult BuildFallbackResult(TripAnalysisInput input)
    {
        int score = 75; // Базовый
        var issues = new List<GeminiIssue>();
        var recs = new List<string>();

        // --- Погода ---
        if (input.Weather.HasDangerousWeather)
        {
            score -= 20;
            issues.Add(new() { Type = "weather", Severity = "critical", Text = $"Прогнозируются опасные метеоявления (грозы/снег/ливень). Температура {input.Weather.TempMin:F0}°C – {input.Weather.TempMax:F0}°C." });
            recs.Add("Рассмотрите перенос похода на другую дату из-за опасных метеоусловий.");
        }
        else if (input.Weather.TempMin < 0)
        {
            score -= 10;
            issues.Add(new() { Type = "weather", Severity = "warning", Text = $"Минимальная температура {input.Weather.TempMin:F0}°C — возможно обледенение троп." });
            recs.Add("Возьмите утеплённую одежду и треккинговые палки для устойчивости.");
        }

        if (input.Weather.WindMaxKmh > 50)
        {
            score -= 15;
            issues.Add(new() { Type = "weather", Severity = "critical", Text = $"Ветер до {input.Weather.WindMaxKmh:F0} км/ч — опасно на хребтах и перевалах." });
        }
        else if (input.Weather.WindMaxKmh > 30)
        {
            score -= 7;
            issues.Add(new() { Type = "weather", Severity = "warning", Text = $"Ветер до {input.Weather.WindMaxKmh:F0} км/ч — будьте осторожны на открытых участках." });
        }

        if (input.Weather.PrecipitationProbability > 70)
        {
            score -= 10;
            issues.Add(new() { Type = "weather", Severity = "warning", Text = $"Вероятность осадков {input.Weather.PrecipitationProbability:F0}% — тропы могут быть скользкими." });
            recs.Add("Обязательна мембранная куртка и водонепроницаемый чехол для рюкзака.");
        }

        // --- Снаряжение ---
        if (!input.Gear.FirstAid)
        {
            score -= 8;
            issues.Add(new() { Type = "gear", Severity = "warning", Text = "Отсутствует горная аптечка — критически важный элемент снаряжения." });
            recs.Add("Возьмите аптечку с эластичным бинтом, антисептиком и обезболивающим.");
        }
        if (!input.Gear.Water)
        {
            score -= 10;
            issues.Add(new() { Type = "gear", Severity = "critical", Text = "Нет запаса воды — обезвоживание в горах наступает быстрее, чем на равнине." });
            recs.Add("Минимум 1.5 л воды на человека, больше при жаре.");
        }
        if (!input.Gear.Flashlight)
        {
            score -= 7;
            issues.Add(new() { Type = "gear", Severity = "warning", Text = $"Нет фонарика. Закат в {input.Weather.Sunset} — рискуете идти в темноте." });
            recs.Add("Налобный фонарь обязателен даже при раннем старте — на случай задержки.");
        }
        if (!input.Gear.Membrane && input.Weather.PrecipitationProbability > 40)
        {
            score -= 5;
            issues.Add(new() { Type = "gear", Severity = "warning", Text = "Нет мембранной куртки при высокой вероятности осадков." });
        }
        if (!input.Gear.WarmClothing && input.Weather.TempMin < 10)
        {
            score -= 5;
            issues.Add(new() { Type = "gear", Severity = "warning", Text = $"Нет тёплой одежды при минимуме {input.Weather.TempMin:F0}°C." });
        }

        // --- Опыт + рельеф ---
        if (input.Experience == "beginner" && input.ElevationGainM > 800)
        {
            score -= 15;
            issues.Add(new() { Type = "elevation", Severity = "critical", Text = $"Набор +{input.ElevationGainM}м слишком сложен для начинающего туриста." });
            recs.Add("Рекомендуем маршрут с набором не более 500м для вашего уровня.");
        }
        else if (input.Experience == "beginner" && input.ElevationGainM > 500)
        {
            score -= 8;
            issues.Add(new() { Type = "elevation", Severity = "warning", Text = $"Набор +{input.ElevationGainM}м может быть утомителен для начинающего." });
        }

        if (input.DistanceKm > 20 && input.Experience == "beginner")
        {
            score -= 10;
            issues.Add(new() { Type = "time", Severity = "warning", Text = $"Дистанция {input.DistanceKm:F1} км — велик риск не успеть до темноты." });
        }

        // --- Бонусы ---
        if (input.Gear.FirstAid && input.Gear.Water && input.Gear.Flashlight && input.Gear.Membrane && input.Gear.WarmClothing)
        {
            score += 8;
            recs.Add("Отличная экипировка! Все ключевые элементы снаряжения на месте.");
        }
        if (input.Experience == "expert") score += 5;
        if (input.GroupSize >= 3) score += 5;

        score = Math.Clamp(score, 0, 100);

        string riskLevel = score switch
        {
            >= 80 => "low",
            >= 60 => "medium",
            >= 40 => "high",
            _ => "critical"
        };

        if (recs.Count == 0)
            recs.Add("Условия выглядят благоприятно. Соблюдайте стандартные меры безопасности.");

        return new GeminiAuditResult
        {
            SafetyScore = score,
            RiskLevel = riskLevel,
            Summary = $"Оценка безопасности: {score}/100 ({riskLevel}). " +
                      $"Маршрут {input.DistanceKm:F1} км, набор +{input.ElevationGainM}м. " +
                      $"Погода: {input.Weather.TempMin:F0}–{input.Weather.TempMax:F0}°C, ветер до {input.Weather.WindMaxKmh:F0} км/ч.",
            Issues = issues,
            Recommendations = recs
        };
    }
}

// ── Input / Output models ──────────────────────────────────────────────────

public class TripAnalysisInput
{
    public double DistanceKm { get; set; }
    public int ElevationGainM { get; set; }
    public string Date { get; set; } = "";
    public string StartTime { get; set; } = "";
    public string Experience { get; set; } = "";
    public int GroupSize { get; set; }
    public GearInput Gear { get; set; } = new();
    public WeatherForecast Weather { get; set; } = new();
}

public class GearInput
{
    public bool FirstAid { get; set; }
    public bool Powerbank { get; set; }
    public bool Membrane { get; set; }
    public bool Flashlight { get; set; }
    public bool Water { get; set; }
    public bool WarmClothing { get; set; }
}

public class GeminiAuditResult
{
    public int SafetyScore { get; set; }
    public string RiskLevel { get; set; } = "";
    public string Summary { get; set; } = "";
    public List<GeminiIssue> Issues { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}

public class GeminiIssue
{
    public string Type { get; set; } = "";
    public string Severity { get; set; } = "";
    public string Text { get; set; } = "";
}
