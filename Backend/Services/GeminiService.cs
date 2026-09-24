using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace Backend.Services;

public class GeminiService : IGeminiService
{
    private readonly IConfiguration _config;
    private readonly ILogger<GeminiService> _logger;
    private readonly HttpClient _httpClient;

    public GeminiService(IConfiguration config, ILogger<GeminiService> logger, IHttpClientFactory httpClientFactory)
    {
        _config = config;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<ResultadoModeracion> AnalizarDuplicado(
        string tituloNuevo,
        string? descripcionNueva,
        List<ReporteCercanoDto> reportesCercanos
    )
    {
        if (reportesCercanos.Count == 0)
        {
            return new ResultadoModeracion
            {
                EsDuplicadoPotencial = false,
                MensajeIA = string.Empty,
                ReportesSimilares = new List<ReporteCercanoDto>()
            };
        }

        var apiKey = _config["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? "";
        var model = _config["GeminiSettings:Model"] ?? "gemini-2.0-flash-lite";

        // Si no hay API Key de Gemini configurada: Fallback heurístico de cercanía por distancia
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogInformation("Gemini API Key no configurada. Aplicando moderación heurística por radio de 50 metros.");
            var masCercano = reportesCercanos.OrderBy(r => r.DistanciaMetros).First();
            return new ResultadoModeracion
            {
                EsDuplicadoPotencial = true,
                MensajeIA = $"Se detectó el reporte #{masCercano.Id} a solo {masCercano.DistanciaMetros:F0} metros: '{masCercano.Titulo}'. ¿Se trata del mismo incidente?",
                ReportesSimilares = reportesCercanos
            };
        }

        try
        {
            var reportesTexto = string.Join("\n", reportesCercanos.Select(r =>
                $"- ID #{r.Id} (Distancia: {r.DistanciaMetros:F0} m, Estado: {r.Estado ?? "Pendiente"}): Título: '{r.Titulo}' | Detalle: '{r.Descripcion ?? "Sin detalle"}'"));

            var prompt = $$"""
                Actúa como el moderador de incidencias urbanas para la Municipalidad de Morón.
                Un vecino está por registrar un nuevo reporte y nuestro sistema georreferenciado detectó que ya existen otros reportes a menos de 50 metros de distancia.
                Determina si el nuevo reporte se refiere probablemente al MISMO incidente o problema urbano.

                NUEVO REPORTE A INGRESAR:
                - Título: "{{tituloNuevo}}"
                - Descripción: "{{descripcionNueva ?? "Sin descripción adicional"}}"

                REPORTES EXISTENTES EN LA MISMA ZONA (radio <= 50 metros):
                {{reportesTexto}}

                INSTRUCCIONES:
                Responde ÚNICAMENTE en formato JSON con la siguiente estructura (sin formato Markdown, sin comillas triples):
                {"esDuplicado": true, "mensaje": "Explicación amable y concisa (máximo 2 oraciones) indicando al vecino por qué parece el mismo incidente o por qué difiere."}
                """;

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    temperature = 0.2,
                    maxOutputTokens = 300
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";
            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, jsonContent);
            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Gemini API retornó código {Status}: {Error}", response.StatusCode, errorText);
                throw new Exception($"Gemini error {response.StatusCode}");
            }

            var responseText = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseText);
            var rawText = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "{}";

            var cleaned = rawText.Trim();
            if (cleaned.StartsWith("```json")) cleaned = cleaned.Substring(7);
            if (cleaned.StartsWith("```")) cleaned = cleaned.Substring(3);
            if (cleaned.EndsWith("```")) cleaned = cleaned.Substring(0, cleaned.Length - 3);
            cleaned = cleaned.Trim();

            using var resultDoc = JsonDocument.Parse(cleaned);
            var esDuplicado = resultDoc.RootElement.GetProperty("esDuplicado").GetBoolean();
            var mensaje = resultDoc.RootElement.GetProperty("mensaje").GetString() ?? "";

            return new ResultadoModeracion
            {
                EsDuplicadoPotencial = esDuplicado,
                MensajeIA = mensaje,
                ReportesSimilares = reportesCercanos
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Fallo en llamada a Gemini API. Aplicando moderación de respaldo por proximidad geográfica.");
            var masCercano = reportesCercanos.OrderBy(r => r.DistanciaMetros).First();
            return new ResultadoModeracion
            {
                EsDuplicadoPotencial = true,
                MensajeIA = $"Se identificó un reporte registrado a {masCercano.DistanciaMetros:F0} metros: '{masCercano.Titulo}'. ¿Desea sumarse a ese reclamo para darle mayor prioridad?",
                ReportesSimilares = reportesCercanos
            };
        }
    }
}
