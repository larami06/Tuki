using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface IInventarioService
{
    Task<InventarioResponseDto?> GetByUsuarioIdAsync(int idUsuario);
    Task UpdateAsync(int idUsuario, InventarioUpdateDto dto);
    Task<InventarioResponseDto> ComprarRecompensaAsync(int idUsuario, int idRecompensa);
}
