namespace TUKI.Application.DTOs;

public class UsuarioCreateDto
{
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
    public string Avatar { get; set; } = "avatar_1";
    public int IdResponsavel { get; set; }
}

public class UsuarioUpdateDto
{
    public string? Avatar { get; set; }
    public string? Tema { get; set; }
}

public class UsuarioResponseDto
{
    public int Id { get; set; }
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
    public string Avatar { get; set; } = string.Empty;
    public string Tema { get; set; } = "#7c3aed";
    public int IdResponsavel { get; set; }
    public int Moedas { get; set; }
    public int Estrelas { get; set; }
    public int LicoesConcluidas { get; set; }
    public int StreakAtual { get; set; }
    public int XP { get; set; }
}
