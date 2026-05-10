using TUKI.Application.DTOs;

namespace TUKI.Application.Interfaces;

public interface IResponsavelService
{
    Task<ResponsavelResponseDto?> GetByIdAsync(int id);
    Task<ResponsavelResponseDto> AddAsync(ResponsavelCreateDto dto);
}
