using System.Text.Json.Serialization;

namespace TUKI.Application.DTOs;

public class InventarioResponseDto
{
    public int IdInventario { get; set; }
    public int IdUsuario { get; set; }
    public int Moedas { get; set; }
    public int Estrelas { get; set; }
    public int LicoesConcluidas { get; set; }
    public int StreakAtual { get; set; }
    public DateOnly? UltimaAtividade { get; set; }
    [JsonPropertyName("xp")]
    public int XP { get; set; }
}

public class InventarioUpdateDto
{
    public int Moedas { get; set; }
    public int Estrelas { get; set; }
    [JsonPropertyName("xp")]
    public int XP { get; set; }
}
