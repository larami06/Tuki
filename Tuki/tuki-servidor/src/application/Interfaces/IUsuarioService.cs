using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioResponseDto>> GetAllAsync();
    Task<UsuarioResponseDto?> GetByIdAsync(int id);
    Task<UsuarioResponseDto> AddAsync(UsuarioCreateDto dto);
    Task<IEnumerable<UsuarioResponseDto>> GetByResponsavelIdAsync(int responsavelId);
    Task<UsuarioResponseDto?> UpdateAsync(int id, UsuarioUpdateDto dto);
    Task<IEnumerable<RecompensaResponseDto>> GetRecompensasAsync(int id);
}
