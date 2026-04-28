using Microsoft.EntityFrameworkCore;
using TUKI.Domain.Entities;

namespace TUKI.Infrastructure.Data;

public class TukiDbContext : DbContext
{
    public TukiDbContext(DbContextOptions<TukiDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Inventario> Inventarios { get; set; } = null!;
    public DbSet<Recompensa> Recompensas { get; set; } = null!;
    public DbSet<Licao> Licoes { get; set; } = null!;
    public DbSet<Progresso> Progressos { get; set; } = null!;
    public DbSet<UsuarioRecompensa> UsuariosRecompensas { get; set; } = null!;
    public DbSet<LicaoRecompensa> LicoesRecompensas { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("usuario");
            e.HasKey(u => u.IdUsuario);
            e.Property(u => u.IdUsuario).HasColumnName("idusuario");
            e.Property(u => u.Nick).HasColumnName("nick").HasMaxLength(50).IsRequired();
            e.Property(u => u.Idade).HasColumnName("idade");
            e.HasIndex(u => u.Nick).IsUnique();
            e.HasOne(u => u.Inventario)
             .WithOne(i => i.Usuario)
             .HasForeignKey<Inventario>(i => i.IdUsuario);
        });

        modelBuilder.Entity<Inventario>(e =>
        {
            e.ToTable("inventario");
            e.HasKey(i => i.IdInventario);
            e.Property(i => i.IdInventario).HasColumnName("idinventario");
            e.Property(i => i.IdUsuario).HasColumnName("idusuario");
            e.Property(i => i.Moedas).HasColumnName("moedas");
            e.Property(i => i.Medalhas).HasColumnName("medalhas");
            e.Property(i => i.Estrelas).HasColumnName("estrelas");
        });

        modelBuilder.Entity<Recompensa>(e =>
        {
            e.ToTable("recompensa");
            e.HasKey(r => r.IdRecompensa);
            e.Property(r => r.IdRecompensa).HasColumnName("idrecompensa");
            e.Property(r => r.Tipo).HasColumnName("tipo").HasMaxLength(50).IsRequired();
            e.Property(r => r.Valor).HasColumnName("valor").HasColumnType("numeric(10,2)");
        });

        modelBuilder.Entity<Licao>(e =>
        {
            e.ToTable("licao");
            e.HasKey(l => l.IdLicao);
            e.Property(l => l.IdLicao).HasColumnName("idlicao");
            e.Property(l => l.Conteudo).HasColumnName("conteudo").IsRequired();
            e.Property(l => l.NivelDificuldade).HasColumnName("niveldificuldade").HasMaxLength(20).IsRequired();
            e.Property(l => l.TipoLicao).HasColumnName("tipolicao").HasMaxLength(50).IsRequired();
            e.Property(l => l.IdadeMinima).HasColumnName("idademinima");
            e.Property(l => l.IdadeMaxima).HasColumnName("idademaxima");
        });

        modelBuilder.Entity<Progresso>(e =>
        {
            e.ToTable("progresso");
            e.HasKey(p => p.IdProgresso);
            e.Property(p => p.IdProgresso).HasColumnName("idprogresso");
            e.Property(p => p.IdUsuario).HasColumnName("idusuario");
            e.Property(p => p.IdLicao).HasColumnName("idlicao");
            e.Property(p => p.Pontuacao).HasColumnName("pontuacao").HasColumnType("numeric(6,2)");
            e.Property(p => p.Tentativas).HasColumnName("tentativas");
            e.Property(p => p.TempoResposta).HasColumnName("temporesposta");
            e.Property(p => p.Concluida).HasColumnName("concluida");
            e.HasOne(p => p.Usuario).WithMany(u => u.Progressos).HasForeignKey(p => p.IdUsuario);
            e.HasOne(p => p.Licao).WithMany(l => l.Progressos).HasForeignKey(p => p.IdLicao);
        });

        modelBuilder.Entity<UsuarioRecompensa>(e =>
        {
            e.ToTable("usuario_recompensa");
            e.HasKey(ur => new { ur.IdUsuario, ur.IdRecompensa });
            e.Property(ur => ur.IdUsuario).HasColumnName("idusuario");
            e.Property(ur => ur.IdRecompensa).HasColumnName("idrecompensa");
            e.HasOne(ur => ur.Usuario).WithMany(u => u.UsuariosRecompensas).HasForeignKey(ur => ur.IdUsuario);
            e.HasOne(ur => ur.Recompensa).WithMany(r => r.UsuariosRecompensas).HasForeignKey(ur => ur.IdRecompensa);
        });

        modelBuilder.Entity<LicaoRecompensa>(e =>
        {
            e.ToTable("licao_recompensa");
            e.HasKey(lr => new { lr.IdLicao, lr.IdRecompensa });
            e.Property(lr => lr.IdLicao).HasColumnName("idlicao");
            e.Property(lr => lr.IdRecompensa).HasColumnName("idrecompensa");
            e.HasOne(lr => lr.Licao).WithMany(l => l.LicoesRecompensas).HasForeignKey(lr => lr.IdLicao);
            e.HasOne(lr => lr.Recompensa).WithMany(r => r.LicoesRecompensas).HasForeignKey(lr => lr.IdRecompensa);
        });
    }
}
