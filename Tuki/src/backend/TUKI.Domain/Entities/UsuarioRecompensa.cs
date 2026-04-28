namespace TUKI.Domain.Entities;

public class UsuarioRecompensa
{
    public int IdUsuario { get; set; }
    public int IdRecompensa { get; set; }

    public Usuario? Usuario { get; set; }
    public Recompensa? Recompensa { get; set; }
}
