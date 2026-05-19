using Microsoft.EntityFrameworkCore;
using TUKI.Application.Interfaces;
using TUKI.Application.Mappings;
using TUKI.Application.Services;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;
using TUKI.Infrastructure.Repositories;
using TUKI.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configuração do PostgreSQL com senha do pass.env
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (File.Exists("pass.env"))
{
    var password = File.ReadAllText("pass.env").Trim();
    connectionString = connectionString?.Replace("Password=", $"Password={password}");
}

builder.Services.AddDbContext<TukiDbContext>(options =>
    options.UseNpgsql(connectionString));

// Repositories
builder.Services.AddScoped<IResponsavelRepository, ResponsavelRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IInventarioRepository, InventarioRepository>();
builder.Services.AddScoped<IRecompensaRepository, RecompensaRepository>();
builder.Services.AddScoped<ILicaoRepository, LicaoRepository>();
builder.Services.AddScoped<IProgressoRepository, ProgressoRepository>();

// Services
builder.Services.AddScoped<IResponsavelService, ResponsavelService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IInventarioService, InventarioService>();
builder.Services.AddScoped<IRecompensaService, RecompensaService>();
builder.Services.AddScoped<ILicaoService, LicaoService>();
builder.Services.AddScoped<IProgressoService, ProgressoService>();

builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddSwaggerGen();

var app = builder.Build();

// SEED DATA - Criando dados iniciais para não dar erro de banco vazio
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TukiDbContext>();
    context.Database.EnsureCreated();

    try
    {
        Console.WriteLine("================================================================================");
        Console.WriteLine("DB DIAGNOSTICS:");
        var users = context.Usuarios.Include(u => u.Inventario).ToList();
        Console.WriteLine($"Total Users: {users.Count}");
        foreach (var u in users)
        {
            Console.WriteLine($"User ID: {u.IdUsuario}, Nick: {u.Nick}, Age: {u.Idade}");
            if (u.Inventario != null)
            {
                Console.WriteLine($"  -> Inventario found! Coins: {u.Inventario.Moedas}, Stars: {u.Inventario.Estrelas}, Concluded: {u.Inventario.LicoesConcluidas}");
            }
            else
            {
                Console.WriteLine("  -> Inventario is NULL!");
            }
            
            var progs = context.Progressos.Where(p => p.IdUsuario == u.IdUsuario).ToList();
            Console.WriteLine($"  -> Total Progress Records: {progs.Count}");
            foreach (var p in progs)
            {
                Console.WriteLine($"     Progresso ID: {p.IdProgresso}, Lesson ID: {p.IdLicao}, Score: {p.Pontuacao}, Concluded: {p.Concluida}");
            }
        }
        Console.WriteLine("================================================================================");
    }
    catch (Exception ex)
    {
        Console.WriteLine("DIAGNOSTICS ERROR: " + ex.Message);
    }

    if (!context.Responsaveis.Any())
    {
        var responsavel = new Responsavel 
        { 
            IdResponsavel = 1, 
            Email = "mock@tuki.com", 
            SenhaHash = "mock_hash" // Senha obrigatória
        };
        context.Responsaveis.Add(responsavel);
        
        var usuario = new Usuario 
        { 
            IdUsuario = 1, 
            Nick = "TukiPlayer", 
            Idade = 8, 
            IdResponsavel = 1,
            Avatar = "avatar_1"
        };
        context.Usuarios.Add(usuario);

        
        context.Inventarios.Add(new Inventario { IdUsuario = 1, Moedas = 100, Estrelas = 5 });
        
        context.SaveChanges();
    }

    if (!context.Recompensas.Any())
    {
        context.Recompensas.AddRange(
            new Recompensa { IdRecompensa = 1, Tipo = "avatar", Valor = 50,  Nome = "Avatar Monstro",  Identificador = "avatar_2" },
            new Recompensa { IdRecompensa = 2, Tipo = "avatar", Valor = 75,  Nome = "Avatar Robô",     Identificador = "avatar_3" },
            new Recompensa { IdRecompensa = 3, Tipo = "avatar", Valor = 100, Nome = "Avatar Alien",    Identificador = "avatar_4" },
            new Recompensa { IdRecompensa = 4, Tipo = "avatar", Valor = 150, Nome = "Avatar Dragão",   Identificador = "avatar_5" },
            new Recompensa { IdRecompensa = 5, Tipo = "fundo",  Valor = 80,  Nome = "Fundo Rosa",      Identificador = "#ec4899" },
            new Recompensa { IdRecompensa = 6, Tipo = "fundo",  Valor = 80,  Nome = "Fundo Verde",     Identificador = "#10b981" },
            new Recompensa { IdRecompensa = 7, Tipo = "fundo",  Valor = 80,  Nome = "Fundo Azul",      Identificador = "#3b82f6" },
            new Recompensa { IdRecompensa = 8, Tipo = "fundo",  Valor = 80,  Nome = "Fundo Laranja",   Identificador = "#f97316" },
            new Recompensa { IdRecompensa = 9, Tipo = "fundo",  Valor = 80,  Nome = "Fundo Vermelho",  Identificador = "#ef4444" }
        );
        context.SaveChanges();
    }

    if (!context.Licoes.Any())
    {
        context.Licoes.AddRange(
            new Licao { IdLicao = 1, Conteudo = "Vogais Mágicas", NivelDificuldade = "Facil", TipoLicao = "Alfabetização", IdadeMinima = 4, IdadeMaxima = 8 },
            new Licao { IdLicao = 2, Conteudo = "Encontro de Sons", NivelDificuldade = "Facil", TipoLicao = "Alfabetização", IdadeMinima = 4, IdadeMaxima = 8 },
            new Licao { IdLicao = 3, Conteudo = "Família do B e C", NivelDificuldade = "Medio", TipoLicao = "Alfabetização", IdadeMinima = 5, IdadeMaxima = 9 },
            new Licao { IdLicao = 4, Conteudo = "Palavras Curtas", NivelDificuldade = "Medio", TipoLicao = "Alfabetização", IdadeMinima = 5, IdadeMaxima = 9 },
            new Licao { IdLicao = 5, Conteudo = "Frases Divertidas", NivelDificuldade = "Dificil", TipoLicao = "Alfabetização", IdadeMinima = 6, IdadeMaxima = 10 },
            new Licao { IdLicao = 6, Conteudo = "Pequenos Contos", NivelDificuldade = "Dificil", TipoLicao = "Alfabetização", IdadeMinima = 6, IdadeMaxima = 10 },
            new Licao { IdLicao = 7, Conteudo = "Desafio Final", NivelDificuldade = "Dificil", TipoLicao = "Alfabetização", IdadeMinima = 7, IdadeMaxima = 11 }
        );
        context.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();

