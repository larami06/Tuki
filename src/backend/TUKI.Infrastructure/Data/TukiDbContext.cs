using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;

namespace TUKI.Infrastructure.Data;

public class TukiDbContext : DbContext
{
    public TukiDbContext(DbContextOptions<TukiDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
