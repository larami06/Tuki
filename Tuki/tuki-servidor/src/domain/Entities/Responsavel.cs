namespace TUKI.Domain.Entities;

public class Responsavel
{
    public int IdResponsavel { get; set; }
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;

    public ICollection<Usuario> Usuarios { get; set; } = [];
}
