namespace TUKI.Domain.Entities;

public class Licao
{
    public int IdLicao { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public string NivelDificuldade { get; set; } = string.Empty;
    public string TipoLicao { get; set; } = string.Empty;
    public int? IdadeMinima { get; set; }
    public int? IdadeMaxima { get; set; }

    public ICollection<Progresso> Progressos { get; set; } = new List<Progresso>();
    public ICollection<LicaoRecompensa> LicoesRecompensas { get; set; } = new List<LicaoRecompensa>();
}
