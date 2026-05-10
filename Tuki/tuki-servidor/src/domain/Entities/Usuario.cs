namespace TUKI.Domain.Entities;

public class Usuario
{
    public int IdUsuario { get; set; }
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
    public string Avatar { get; set; } = "avatar_1";
    public int IdResponsavel { get; set; }

    public Responsavel? Responsavel { get; set; }
    public Inventario? Inventario { get; set; }
    public ICollection<Progresso> Progressos { get; set; } = new List<Progresso>();
    public ICollection<UsuarioRecompensa> UsuariosRecompensas { get; set; } = new List<UsuarioRecompensa>();
}
