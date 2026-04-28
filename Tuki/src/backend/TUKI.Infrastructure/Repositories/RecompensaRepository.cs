using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;

namespace TUKI.Infrastructure.Repositories;

public class RecompensaRepository : IRecompensaRepository
{
    private readonly TukiDbContext _context;

    public RecompensaRepository(TukiDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Recompensa>> GetAllAsync()
        => await _context.Recompensas.ToListAsync();

    public async Task<Recompensa?> GetByIdAsync(int id)
        => await _context.Recompensas.FindAsync(id);

    public async Task AddAsync(Recompensa recompensa)
    {
        await _context.Recompensas.AddAsync(recompensa);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Recompensa recompensa)
    {
        _context.Recompensas.Update(recompensa);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var recompensa = await _context.Recompensas.FindAsync(id);
        if (recompensa != null)
        {
            _context.Recompensas.Remove(recompensa);
            await _context.SaveChangesAsync();
        }
    }
}
