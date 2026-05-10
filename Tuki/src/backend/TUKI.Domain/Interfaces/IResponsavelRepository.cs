using TUKI.Domain.Entities;

namespace TUKI.Domain.Interfaces;

public interface IResponsavelRepository
{
    Task<Responsavel?> GetByIdAsync(int id);
    Task<Responsavel?> GetByEmailAsync(string email);
    Task AddAsync(Responsavel responsavel);
}
