using TUKI.Domain.Entities;

namespace TUKI.Domain.Interfaces;

public interface IInventarioRepository
{
    Task<Inventario?> GetByUsuarioIdAsync(int idUsuario);
    Task AddAsync(Inventario inventario);
    Task UpdateAsync(Inventario inventario);
}
