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

