namespace TUKI.Application.DTOs;

public class RecompensaCreateDto
{
    public string Tipo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
}

public class RecompensaResponseDto
{
    public int Id { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
}
