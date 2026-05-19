namespace TUKI.Domain.Entities;

public class Recompensa
{
    public int IdRecompensa { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Identificador { get; set; } = string.Empty;

    public ICollection<UsuarioRecompensa> UsuariosRecompensas { get; set; } = new List<UsuarioRecompensa>();
    public ICollection<LicaoRecompensa> LicoesRecompensas { get; set; } = new List<LicaoRecompensa>();
}
