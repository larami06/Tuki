using TUKI.Domain.Entities;

namespace TUKI.Domain.Interfaces;

public interface IProgressoRepository
{
    Task<IEnumerable<Progresso>> GetByUsuarioAsync(int idUsuario);
    Task<Progresso?> GetByIdAsync(int id);
    Task<Progresso?> GetByUsuarioELicaoAsync(int idUsuario, int idLicao);
    Task AddAsync(Progresso progresso);
    Task UpdateAsync(Progresso progresso);
}
