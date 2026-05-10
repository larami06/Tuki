namespace TUKI.Application.DTOs;

public class ResponsavelCreateDto
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}

public class ResponsavelResponseDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
}
