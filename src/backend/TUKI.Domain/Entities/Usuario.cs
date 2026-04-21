namespace TUKI.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }
    public string Nick { get; set; } = string.Empty;
    public int Idade { get; set; }
    public string Avatar { get; set; } = string.Empty;

    // Construtor para boas práticas (Clean Architecture)
    public Usuario() { }

    public Usuario(string nick, int idade, string avatar)
    {
        Nick = nick;
        Idade = idade;
        Avatar = avatar;
    }
}
