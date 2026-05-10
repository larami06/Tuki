namespace TUKI.Application.DTOs;

public class UsuarioCreateDto
{
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
    public string Avatar { get; set; } = "avatar_1";
    public int IdResponsavel { get; set; }
}

public class UsuarioResponseDto
{
    public int Id { get; set; }
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
    public string Avatar { get; set; } = string.Empty;
    public int IdResponsavel { get; set; }
}
