using TUKI.Domain.Entities;

namespace TUKI.Domain.Interfaces;

public interface IRecompensaRepository
{
    Task<IEnumerable<Recompensa>> GetAllAsync();
    Task<Recompensa?> GetByIdAsync(int id);
    Task AddAsync(Recompensa recompensa);
    Task UpdateAsync(Recompensa recompensa);
    Task DeleteAsync(int id);
}
