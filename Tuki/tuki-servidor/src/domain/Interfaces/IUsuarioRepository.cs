using TUKI.Domain.Entities;

namespace TUKI.Domain.Interfaces;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByIdAsync(int id);
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task AddAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task DeleteAsync(int id);
    Task<IEnumerable<Usuario>> GetByResponsavelIdAsync(int responsavelId);
    Task<IEnumerable<Recompensa>> GetRecompensasAsync(int idUsuario);
    Task AdicionarRecompensaPadraoAsync(int idUsuario, string identificadorAvatar);
}
