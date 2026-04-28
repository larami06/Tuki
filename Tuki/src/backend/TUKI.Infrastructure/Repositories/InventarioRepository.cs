using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;

namespace TUKI.Infrastructure.Repositories;

public class InventarioRepository : IInventarioRepository
{
    private readonly TukiDbContext _context;

    public InventarioRepository(TukiDbContext context)
    {
        _context = context;
    }

    public async Task<Inventario?> GetByUsuarioIdAsync(int idUsuario)
        => await _context.Inventarios.FirstOrDefaultAsync(i => i.IdUsuario == idUsuario);

    public async Task AddAsync(Inventario inventario)
    {
        await _context.Inventarios.AddAsync(inventario);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Inventario inventario)
    {
        _context.Inventarios.Update(inventario);
        await _context.SaveChangesAsync();
    }
}
