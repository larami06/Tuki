using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;

namespace TUKI.Infrastructure.Repositories;

public class ProgressoRepository : IProgressoRepository
{
    private readonly TukiDbContext _context;

    public ProgressoRepository(TukiDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Progresso>> GetByUsuarioAsync(int idUsuario)
        => await _context.Progressos.Where(p => p.IdUsuario == idUsuario).ToListAsync();

    public async Task<Progresso?> GetByIdAsync(int id)
        => await _context.Progressos.FindAsync(id);

    public async Task<Progresso?> GetByUsuarioELicaoAsync(int idUsuario, int idLicao)
        => await _context.Progressos
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario && p.IdLicao == idLicao);

    public async Task AddAsync(Progresso progresso)
    {
        await _context.Progressos.AddAsync(progresso);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Progresso progresso)
    {
        _context.Progressos.Update(progresso);
        await _context.SaveChangesAsync();
    }
}
