using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;

namespace TUKI.Infrastructure.Repositories;

public class ResponsavelRepository : IResponsavelRepository
{
    private readonly TukiDbContext _context;

    public ResponsavelRepository(TukiDbContext context)
    {
        _context = context;
    }

    public async Task<Responsavel?> GetByIdAsync(int id)
        => await _context.Responsaveis.FindAsync(id);

    public async Task<Responsavel?> GetByEmailAsync(string email)
        => await _context.Responsaveis.FirstOrDefaultAsync(r => r.Email == email);

    public async Task AddAsync(Responsavel responsavel)
    {
        await _context.Responsaveis.AddAsync(responsavel);
        await _context.SaveChangesAsync();
    }
}
