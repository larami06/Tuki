namespace TUKI.Application.DTOs;

public class LicaoCreateDto
{
    public string Conteudo { get; set; } = string.Empty;
    public string NivelDificuldade { get; set; } = string.Empty;
    public string TipoLicao { get; set; } = string.Empty;
    public int? IdadeMinima { get; set; }
    public int? IdadeMaxima { get; set; }
}

public class LicaoResponseDto
{
    public int Id { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public string NivelDificuldade { get; set; } = string.Empty;
    public string TipoLicao { get; set; } = string.Empty;
    public int? IdadeMinima { get; set; }
    public int? IdadeMaxima { get; set; }
}
