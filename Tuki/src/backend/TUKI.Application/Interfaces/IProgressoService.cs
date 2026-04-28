using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface IProgressoService
{
    Task<IEnumerable<ProgressoResponseDto>> GetByUsuarioAsync(int idUsuario);
    Task<ProgressoResponseDto?> GetByIdAsync(int id);
    Task<ProgressoResponseDto> RegistrarAsync(ProgressoCreateDto dto);
    Task UpdateAsync(int id, ProgressoCreateDto dto);
}
