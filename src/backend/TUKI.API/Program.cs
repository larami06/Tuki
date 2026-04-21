using Microsoft.EntityFrameworkCore;
using TUKI.Application.Interfaces;
using TUKI.Application.Mappings;
using TUKI.Application.Services;
using TUKI.Domain.Interfaces;
using TUKI.Infrastructure.Data;
using TUKI.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// DbContext
builder.Services.AddDbContext<TukiDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// Services
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// OpenAPI/Swagger
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
