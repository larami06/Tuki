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

    // Remove duplicatas de recompensas pelo identificador (mantém o menor ID)
    var recompensasDuplicadas = context.Recompensas
        .AsEnumerable()
        .GroupBy(r => r.Identificador)
        .Where(g => g.Count() > 1)
        .SelectMany(g => g.OrderBy(r => r.IdRecompensa).Skip(1))
        .ToList();

    if (recompensasDuplicadas.Count > 0)
    {
        var idsDuplicados = recompensasDuplicadas.Select(r => r.IdRecompensa).ToList();
        var refsDuplicadas = context.UsuariosRecompensas
            .Where(ur => idsDuplicados.Contains(ur.IdRecompensa))
            .ToList();
        context.UsuariosRecompensas.RemoveRange(refsDuplicadas);
        context.Recompensas.RemoveRange(recompensasDuplicadas);
        context.SaveChanges();
        Console.WriteLine($"Seed: {recompensasDuplicadas.Count} recompensas duplicadas removidas.");
    }

    // Seed canônico: garante que os 4 avatares + 5 fundos corretos existam
    var recompensasCanônicas = new[]
    {
        new { Identificador = "avatar_2", Tipo = "avatar", Valor = 50m,  Nome = "Tuki Explorador" },
        new { Identificador = "avatar_3", Tipo = "avatar", Valor = 100m, Nome = "Tuki Aventureiro" },
        new { Identificador = "avatar_4", Tipo = "avatar", Valor = 150m, Nome = "Tuki Mestre"      },
        new { Identificador = "avatar_5", Tipo = "avatar", Valor = 200m, Nome = "Tuki Lendário"    },
        new { Identificador = "#ec4899",  Tipo = "fundo",  Valor = 80m,  Nome = "Fundo Rosa"       },
        new { Identificador = "#10b981",  Tipo = "fundo",  Valor = 80m,  Nome = "Fundo Verde"      },
        new { Identificador = "#3b82f6",  Tipo = "fundo",  Valor = 80m,  Nome = "Fundo Azul"       },
        new { Identificador = "#f97316",  Tipo = "fundo",  Valor = 80m,  Nome = "Fundo Laranja"    },
        new { Identificador = "#ef4444",  Tipo = "fundo",  Valor = 80m,  Nome = "Fundo Vermelho"   },
    };

    var identificadoresExistentes = context.Recompensas
        .Select(r => r.Identificador)
        .ToHashSet();

    foreach (var r in recompensasCanônicas)
    {
        if (!identificadoresExistentes.Contains(r.Identificador))
        {
            context.Recompensas.Add(new Recompensa
            {
                Tipo = r.Tipo,
                Valor = r.Valor,
                Nome = r.Nome,
                Identificador = r.Identificador,
            });
        }
    }
    context.SaveChanges();

    if (!context.Licoes.Any())
    {
        context.Licoes.AddRange(
            new Licao { IdLicao = 1, Conteudo = "Vogais Mágicas", NivelDificuldade = "Facil", TipoLicao = "Alfabetização", IdadeMinima = 4, IdadeMaxima = 8 },
            new Licao { IdLicao = 2, Conteudo = "Encontro de Sons", NivelDificuldade = "Facil", TipoLicao = "Alfabetização", IdadeMinima = 4, IdadeMaxima = 8 },
            new Licao { IdLicao = 3, Conteudo = "Família do B e C", NivelDificuldade = "Medio", TipoLicao = "Alfabetização", IdadeMinima = 5, IdadeMaxima = 9 },
            new Licao { IdLicao = 4, Conteudo = "Palavras Curtas", NivelDificuldade = "Medio", TipoLicao = "Alfabetização", IdadeMinima = 5, IdadeMaxima = 9 },
            new Licao { IdLicao = 5, Conteudo = "Frases Divertidas", NivelDificuldade = "Dificil", TipoLicao = "Alfabetização", IdadeMinima = 6, IdadeMaxima = 10 },
            new Licao { IdLicao = 6, Conteudo = "Pequenos Contos", NivelDificuldade = "Dificil", TipoLicao = "Alfabetização", IdadeMinima = 6, IdadeMaxima = 10 },
            new Licao { IdLicao = 7, Conteudo = "Desafio Final", NivelDificuldade = "Dificil", TipoLicao = "Alfabetização", IdadeMinima = 7, IdadeMaxima = 11 },
            new Licao { IdLicao = 10, Conteudo = "Aventuras na Floresta", NivelDificuldade = "Facil", TipoLicao = "Historias", IdadeMinima = 4, IdadeMaxima = 8 },
            new Licao { IdLicao = 11, Conteudo = "O Misterio da Lua", NivelDificuldade = "Facil", TipoLicao = "Historias", IdadeMinima = 4, IdadeMaxima = 8 }
        );
        context.SaveChanges();
    }

    // Garante que todas as lições novas existam mesmo em bancos já populados
    var licoesNovas = new (int Id, string Conteudo, string Nivel, string Tipo, int IdMin, int IdMax)[]
    {
        (10, "Aventuras na Floresta",  "Facil",  "Historias",   4, 8),
        (11, "O Misterio da Lua",      "Facil",  "Historias",   4, 8),
        // Trilha de Histórias
        (20, "O Pequeno Tuki",         "Facil",  "Historias",   4, 8),
        (21, "Reino das Cores",        "Facil",  "Historias",   4, 8),
        (22, "Amigos da Floresta",     "Facil",  "Historias",   4, 8),
        (23, "Viagem ao Mar",          "Medio",  "Historias",   5, 9),
        (24, "Dragao Amigavel",        "Medio",  "Historias",   5, 9),
        (25, "Noite Estrelada",        "Dificil","Historias",   6, 10),
        (26, "Festa no Castelo",       "Dificil","Historias",   6, 10),
        // Trilha de Matemática
        (30, "Contando Estrelas",      "Facil",  "Matematica",  4, 8),
        (31, "Soma Espacial",          "Facil",  "Matematica",  4, 8),
        (32, "Subtracao Lunar",        "Medio",  "Matematica",  5, 9),
        (33, "Formas Geometricas",     "Medio",  "Matematica",  5, 9),
        (34, "Maior ou Menor",         "Medio",  "Matematica",  5, 9),
        (35, "Logica Alienigena",      "Dificil","Matematica",  6, 10),
        (36, "Mestre da Galaxia",      "Dificil","Matematica",  7, 11),
    };

    var existentes = context.Licoes.Select(l => l.IdLicao).ToHashSet();
    var paraAdicionar = licoesNovas
        .Where(l => !existentes.Contains(l.Id))
        .Select(l => new Licao
        {
            IdLicao = l.Id,
            Conteudo = l.Conteudo,
            NivelDificuldade = l.Nivel,
            TipoLicao = l.Tipo,
            IdadeMinima = l.IdMin,
            IdadeMaxima = l.IdMax,
        })
        .ToList();

    if (paraAdicionar.Count > 0)
    {
        context.Licoes.AddRange(paraAdicionar);
        context.SaveChanges();
        Console.WriteLine($"Seed: {paraAdicionar.Count} lições novas adicionadas.");
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

