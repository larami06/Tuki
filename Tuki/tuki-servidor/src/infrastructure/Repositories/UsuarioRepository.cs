using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;

namespace TUKI.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly TukiDbContext _context;

    public UsuarioRepository(TukiDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        return await _context.Usuarios
            .Include(u => u.Inventario)
            .FirstOrDefaultAsync(u => u.IdUsuario == id);
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync()
    {
        return await _context.Usuarios
            .Include(u => u.Inventario)
            .ToListAsync();
    }

    public async Task AddAsync(Usuario usuario)
    {
        await _context.Usuarios.AddAsync(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario != null)
        {
            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Usuario>> GetByResponsavelIdAsync(int responsavelId)
    {
        return await _context.Usuarios
            .Include(u => u.Inventario)
            .Where(u => u.IdResponsavel == responsavelId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Recompensa>> GetRecompensasAsync(int idUsuario)
    {
        return await _context.UsuariosRecompensas
            .Where(ur => ur.IdUsuario == idUsuario)
            .Include(ur => ur.Recompensa)
            .Select(ur => ur.Recompensa!)
            .ToListAsync();
    }
}
