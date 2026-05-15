namespace TUKI.Application.DTOs;

public class ProgressoCreateDto
{
    public int IdUsuario { get; set; }
    public int IdLicao { get; set; }
    public decimal? Pontuacao { get; set; }
    public int Tentativas { get; set; }
    public int? TempoResposta { get; set; }
    public bool Concluida { get; set; }
}

public class ProgressoResponseDto
{
    public int Id { get; set; }
    public int IdUsuario { get; set; }
    public int IdLicao { get; set; }
    public decimal? Pontuacao { get; set; }
    public int Tentativas { get; set; }
    public int? TempoResposta { get; set; }
    public bool Concluida { get; set; }
    public string Materia { get; set; } = string.Empty;
}
