namespace TUKI.Application.DTOs;

public class InventarioResponseDto
{
    public int IdInventario { get; set; }
    public int IdUsuario { get; set; }
    public int Moedas { get; set; }
    public int Medalhas { get; set; }
    public int Estrelas { get; set; }
}

public class InventarioUpdateDto
{
    public int Moedas { get; set; }
    public int Medalhas { get; set; }
    public int Estrelas { get; set; }
}
