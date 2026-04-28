namespace TUKI.Application.DTOs;

public class UsuarioCreateDto
{
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
}

public class UsuarioResponseDto
{
    public int Id { get; set; }
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
}
