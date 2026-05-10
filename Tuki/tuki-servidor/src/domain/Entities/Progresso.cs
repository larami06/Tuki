namespace TUKI.Domain.Entities;

public class Progresso
{
    public int IdProgresso { get; set; }
    public int IdUsuario { get; set; }
    public int IdLicao { get; set; }
    public decimal? Pontuacao { get; set; }
    public int Tentativas { get; set; }
    public int? TempoResposta { get; set; }
    public bool Concluida { get; set; }

    public Usuario? Usuario { get; set; }
    public Licao? Licao { get; set; }
}
