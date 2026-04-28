using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface ILicaoService
{
    Task<IEnumerable<LicaoResponseDto>> GetAllAsync();
    Task<LicaoResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<LicaoResponseDto>> GetByIdadeAsync(int idade);
    Task<LicaoResponseDto> AddAsync(LicaoCreateDto dto);
    Task UpdateAsync(int id, LicaoCreateDto dto);
    Task DeleteAsync(int id);
}
