using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;

namespace TUKI.Infrastructure.Repositories;

public class LicaoRepository : ILicaoRepository
{
    private readonly TukiDbContext _context;

    public LicaoRepository(TukiDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Licao>> GetAllAsync()
        => await _context.Licoes.ToListAsync();

    public async Task<Licao?> GetByIdAsync(int id)
        => await _context.Licoes.FindAsync(id);

    public async Task<IEnumerable<Licao>> GetByIdadeAsync(int idade)
        => await _context.Licoes
            .Where(l => (l.IdadeMinima == null || idade >= l.IdadeMinima) &&
                        (l.IdadeMaxima == null || idade <= l.IdadeMaxima))
            .ToListAsync();

    public async Task AddAsync(Licao licao)
    {
        await _context.Licoes.AddAsync(licao);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Licao licao)
    {
        _context.Licoes.Update(licao);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var licao = await _context.Licoes.FindAsync(id);
        if (licao != null)
        {
            _context.Licoes.Remove(licao);
            await _context.SaveChangesAsync();
        }
    }
}
