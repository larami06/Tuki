using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class ResponsavelService : IResponsavelService
{
    private readonly IResponsavelRepository _repository;
    private readonly IMapper _mapper;

    public ResponsavelService(IResponsavelRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<ResponsavelResponseDto?> GetByIdAsync(int id)
    {
        var responsavel = await _repository.GetByIdAsync(id);
        return _mapper.Map<ResponsavelResponseDto?>(responsavel);
    }

    public async Task<ResponsavelResponseDto> AddAsync(ResponsavelCreateDto dto)
    {
        var responsavel = new Responsavel
        {
            Email = dto.Email,
            SenhaHash = dto.Senha
        };
        await _repository.AddAsync(responsavel);
        return _mapper.Map<ResponsavelResponseDto>(responsavel);
    }
}
