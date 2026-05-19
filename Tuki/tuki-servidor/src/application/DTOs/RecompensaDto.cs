namespace TUKI.Application.DTOs;

public class RecompensaCreateDto
{
    public string Tipo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Identificador { get; set; } = string.Empty;
}

public class RecompensaResponseDto
{
    public int Id { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Identificador { get; set; } = string.Empty;
}

public class ComprarRecompensaDto
{
    public int IdRecompensa { get; set; }
}
