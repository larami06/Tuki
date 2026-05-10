namespace TUKI.Domain.Entities;

public class Inventario
{
    public int IdInventario { get; set; }
    public int IdUsuario { get; set; }
    public int Moedas { get; set; } = 0;
    public int Estrelas { get; set; } = 0;
    public int LicoesConcluidas { get; set; } = 0;
    public int StreakAtual { get; set; } = 0;
    public DateOnly? UltimaAtividade { get; set; }

    public Usuario? Usuario { get; set; }
}
