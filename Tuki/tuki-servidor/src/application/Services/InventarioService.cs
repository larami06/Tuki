using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class InventarioService : IInventarioService
{
    private readonly IInventarioRepository _repository;
    private readonly IMapper _mapper;

    public InventarioService(IInventarioRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<InventarioResponseDto?> GetByUsuarioIdAsync(int idUsuario)
    {
        var inventario = await _repository.GetByUsuarioIdAsync(idUsuario);
        return _mapper.Map<InventarioResponseDto?>(inventario);
    }

    public async Task UpdateAsync(int idUsuario, InventarioUpdateDto dto)
    {
        var inventario = await _repository.GetByUsuarioIdAsync(idUsuario)
            ?? throw new KeyNotFoundException($"Inventário do usuário {idUsuario} não encontrado.");
        inventario.Moedas = dto.Moedas;
        inventario.Estrelas = dto.Estrelas;
        inventario.XP = dto.XP;
        await _repository.UpdateAsync(inventario);
    }

    public async Task<InventarioResponseDto> ComprarRecompensaAsync(int idUsuario, int idRecompensa)
    {
        await _repository.ComprarRecompensaAsync(idUsuario, idRecompensa);
        var inventario = await _repository.GetByUsuarioIdAsync(idUsuario);
        return _mapper.Map<InventarioResponseDto>(inventario!);
    }
}
