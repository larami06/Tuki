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

            // 🔥 salva hash da senha
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha)
        };

        await _repository.AddAsync(responsavel);

        return _mapper.Map<ResponsavelResponseDto>(responsavel);
    }

    // 🔥 LOGIN
    public async Task<ResponsavelResponseDto?> LoginAsync(LoginDto dto)
    {
        var responsavel = await _repository.GetByEmailAsync(dto.Email);

        if (responsavel == null)
            return null;

        bool senhaValida = BCrypt.Net.BCrypt.Verify(
            dto.Senha,
            responsavel.SenhaHash
        );

        if (!senhaValida)
            return null;

        return _mapper.Map<ResponsavelResponseDto>(responsavel);
    }
}