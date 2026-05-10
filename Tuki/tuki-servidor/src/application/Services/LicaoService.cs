using AutoMapper;
using TUKI.Application.DTOs;
using TUKI.Application.Interfaces;
using TUKI.Domain.Entities;
using TUKI.Domain.Interfaces;

namespace TUKI.Application.Services;

public class LicaoService : ILicaoService
{
    private readonly ILicaoRepository _repository;
    private readonly IMapper _mapper;

    public LicaoService(ILicaoRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<LicaoResponseDto>> GetAllAsync()
        => _mapper.Map<IEnumerable<LicaoResponseDto>>(await _repository.GetAllAsync());

    public async Task<LicaoResponseDto?> GetByIdAsync(int id)
        => _mapper.Map<LicaoResponseDto?>(await _repository.GetByIdAsync(id));

    public async Task<IEnumerable<LicaoResponseDto>> GetByIdadeAsync(int idade)
        => _mapper.Map<IEnumerable<LicaoResponseDto>>(await _repository.GetByIdadeAsync(idade));

    public async Task<LicaoResponseDto> AddAsync(LicaoCreateDto dto)
    {
        var licao = _mapper.Map<Licao>(dto);
        await _repository.AddAsync(licao);
        return _mapper.Map<LicaoResponseDto>(licao);
    }

    public async Task UpdateAsync(int id, LicaoCreateDto dto)
    {
        var licao = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Lição {id} não encontrada.");
        _mapper.Map(dto, licao);
        await _repository.UpdateAsync(licao);
    }

    public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
}
