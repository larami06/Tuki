using TUKI.Domain.Entities;

namespace TUKI.Domain.Interfaces;

public interface ILicaoRepository
{
    Task<IEnumerable<Licao>> GetAllAsync();
    Task<Licao?> GetByIdAsync(int id);
    Task<IEnumerable<Licao>> GetByIdadeAsync(int idade);
    Task AddAsync(Licao licao);
    Task UpdateAsync(Licao licao);
    Task DeleteAsync(int id);
}
