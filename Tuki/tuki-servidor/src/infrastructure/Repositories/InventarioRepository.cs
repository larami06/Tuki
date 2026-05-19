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

    public async Task ComprarRecompensaAsync(int idUsuario, int idRecompensa)
    {
        var inventario = await _context.Inventarios.FirstOrDefaultAsync(i => i.IdUsuario == idUsuario)
            ?? throw new KeyNotFoundException("Inventário não encontrado.");

        var recompensa = await _context.Recompensas.FindAsync(idRecompensa)
            ?? throw new KeyNotFoundException("Recompensa não encontrada.");

        var jaAdquirida = await _context.UsuariosRecompensas
            .AnyAsync(ur => ur.IdUsuario == idUsuario && ur.IdRecompensa == idRecompensa);

        if (jaAdquirida)
            throw new InvalidOperationException("Item já adquirido.");

        if (inventario.Moedas < (int)recompensa.Valor)
            throw new InvalidOperationException("Moedas insuficientes.");

        inventario.Moedas -= (int)recompensa.Valor;
        _context.UsuariosRecompensas.Add(new UsuarioRecompensa { IdUsuario = idUsuario, IdRecompensa = idRecompensa });
        await _context.SaveChangesAsync();
    }
}
