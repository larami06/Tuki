using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioResponseDto>> GetAllAsync();
    Task<UsuarioResponseDto?> GetByIdAsync(int id);
    Task<UsuarioResponseDto> AddAsync(UsuarioCreateDto dto);
}
