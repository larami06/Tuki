using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

public interface IResponsavelService
{
    Task<ResponsavelResponseDto?> GetByIdAsync(int id);
    Task<ResponsavelResponseDto> AddAsync(ResponsavelCreateDto dto);

    Task<ResponsavelResponseDto?> LoginAsync(LoginDto dto);
}