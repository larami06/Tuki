namespace TUKI.Domain.Entities;

public class Inventario
{
    public int IdInventario { get; set; }
    public int IdUsuario { get; set; }
    public int Moedas { get; set; } = 0;
    public int Medalhas { get; set; } = 0;
    public int Estrelas { get; set; } = 0;

    public Usuario? Usuario { get; set; }
}
