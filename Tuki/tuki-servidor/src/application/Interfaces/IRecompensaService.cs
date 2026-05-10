using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface IRecompensaService
{
    Task<IEnumerable<RecompensaResponseDto>> GetAllAsync();
    Task<RecompensaResponseDto?> GetByIdAsync(int id);
    Task<RecompensaResponseDto> AddAsync(RecompensaCreateDto dto);
    Task UpdateAsync(int id, RecompensaCreateDto dto);
    Task DeleteAsync(int id);
}
