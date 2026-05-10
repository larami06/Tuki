namespace TUKI.Domain.Entities;

public class LicaoRecompensa
{
    public int IdLicao { get; set; }
    public int IdRecompensa { get; set; }

    public Licao? Licao { get; set; }
    public Recompensa? Recompensa { get; set; }
}
